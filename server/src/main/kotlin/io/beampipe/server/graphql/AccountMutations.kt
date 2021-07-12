package io.beampipe.server.graphql

import com.stripe.model.Customer
import com.stripe.model.Subscription
import com.stripe.model.checkout.Session
import com.stripe.param.CustomerCreateParams
import com.stripe.param.checkout.SessionCreateParams
import io.beampipe.server.auth.canonicaliseEmail
import io.beampipe.server.auth.hashPassword
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.ResetTokens
import io.beampipe.server.graphql.util.Context
import io.beampipe.server.graphql.util.CustomException
import io.vertx.core.json.JsonObject
import io.vertx.ext.auth.JWTOptions
import io.vertx.ext.auth.jwt.JWTAuth
import io.vertx.kotlin.coroutines.await
import org.apache.commons.validator.routines.EmailValidator
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.security.SecureRandom
import java.time.ZoneId
import java.util.*


class AccountMutations(
    private val stripeProduct: String,
    private val jwtAuth: JWTAuth
) {
    suspend fun updateName(context: Context, name: String): String = context.withAccountId { accountId ->
        newSuspendedTransaction {
            Accounts.update({
                Accounts.id.eq(accountId)
            }) {
                it[Accounts.name] = name
            }

            name
        }
    }

    suspend fun updateEmail(context: Context, email: String): String = context.withAccountId { accountId ->
        if (!EmailValidator.getInstance().isValid(email)) {
            throw CustomException("Invalid email address")
        }

        newSuspendedTransaction {
            Accounts.update({
                Accounts.id.eq(accountId)
            }) {
                it[Accounts.email] = canonicaliseEmail(email)
            }

            email
        }
    }


    suspend fun updateTimeZone(context: Context, timeZone: String): String = context.withAccountId { accountId ->
        try {
            ZoneId.of(timeZone)
        } catch (e: java.lang.Exception) {
            throw CustomException("Invalid timezone")
        }

        newSuspendedTransaction {
            Accounts.update({
                Accounts.id.eq(accountId)
            }) {
                it[Accounts.timeZone] = timeZone
            }

            timeZone
        }
    }

    suspend fun subscribe(context: Context): String? {
        val stripeId = newSuspendedTransaction {
            val existingStripeId = Accounts
                .slice(Accounts.stripeId)
                .select { Accounts.id.eq(context.accountId) }
                .first()[Accounts.stripeId]

            if (existingStripeId == null) {
                val customer = Customer.create(
                    CustomerCreateParams.builder()
                        .build()
                )

                Accounts.update({
                    Accounts.id.eq(context.accountId)
                }) {
                    it[Accounts.stripeId] = customer.id
                }

                customer.id
            } else {
                existingStripeId
            }
        }

        val sessionCreateParams = SessionCreateParams.builder()
            .setSuccessUrl("${context.host}/stripe?sessionId={CHECKOUT_SESSION_ID}")
            .setCancelUrl("${context.host}/settings?cancel=true")
            .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
            .setCustomer(stripeId)
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPrice(stripeProduct)
                    .build()
            )
            .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
            .build()

        val session = Session.create(sessionCreateParams)
        return session.id
    }

    suspend fun cancelSubscription(context: Context): String = context.withAccountId { accountId ->
        newSuspendedTransaction {
            val stripeId = Accounts
                .slice(Accounts.stripeId)
                .select { Accounts.id.eq(accountId) }
                .first()[Accounts.stripeId]

            val subscriptionId = Customer.retrieve(stripeId)
                .subscriptions.data[0].id

            val subscription = Subscription.retrieve(subscriptionId).cancel()

            Accounts.update({ Accounts.id.eq(context.accountId) }) {
                it[Accounts.subscription] = "cancelled"
            }

            subscriptionId
        }
    }

    suspend fun createUser(email: String, password: String, emailOk: Boolean) =
        newSuspendedTransaction {
            if (!EmailValidator.getInstance().isValid(email)) {
                throw CustomException("Email address is invalid")
            }

            if (password.length < 8) {
                throw CustomException("Invalid password")
            }

            val existingAccount = Accounts.slice(Accounts.id)
                .select { Accounts.email.eq(email) }
                .limit(1)
                .firstOrNull()

            if (existingAccount != null) {
                throw CustomException("Account already registered with this email address")
            } else {
                val salt = ByteArray(16)
                SecureRandom().nextBytes(salt)
                val enc: Base64.Encoder = Base64.getEncoder()

                Accounts.insertAndGetId {
                    it[Accounts.email] = email
                    it[Accounts.password] = hashPassword(password, salt)
                    it[Accounts.salt] = enc.encodeToString(salt)
                    it[Accounts.emailOk] = emailOk
                }.value
            }
        }

    suspend fun createPasswordReset(email: String) = newSuspendedTransaction {
        val accountId = Accounts.select { Accounts.email eq email }.firstOrNull()?.get(Accounts.id)?.value

        if (accountId != null) {
            val token = jwtAuth.generateToken(JsonObject().put("sub", accountId.toString()), JWTOptions().setExpiresInSeconds(7 * 24 * 60 * 60))

            ResetTokens.insert {
                it[ResetTokens.accountId] = accountId
                it[ResetTokens.token] = token
            }
        }

        email
    }

    suspend fun resetPassword(token: String, password: String) = newSuspendedTransaction {
        if (password.length < 8) {
            throw CustomException("Invalid password")
        }

        val accountId = ResetTokens.select { ResetTokens.token eq token and (ResetTokens.isUsed.isNull() or ResetTokens.isUsed.eq(false))}
            .firstOrNull()
            ?.get(ResetTokens.accountId)

        val auth = jwtAuth.authenticate(JsonObject().put("token", token)).await()

        if (accountId != null && auth != null) {
            val salt = ByteArray(16)
            SecureRandom().nextBytes(salt)
            val enc: Base64.Encoder = Base64.getEncoder()

            Accounts.update({ Accounts.id eq accountId }) {
                it[Accounts.salt] = enc.encodeToString(salt)
                it[Accounts.password] = hashPassword(password, salt)
            }

            ResetTokens.update({ ResetTokens.accountId eq accountId }) {
                it[ResetTokens.isUsed] = true
            }

        } else {
            throw CustomException("Invalid or expired token")
        }

        "OK"
    }
}