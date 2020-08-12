package io.beampipe.server.graphql

import com.stripe.model.Customer
import com.stripe.model.Subscription
import com.stripe.model.checkout.Session
import com.stripe.param.CustomerCreateParams
import com.stripe.param.checkout.SessionCreateParams
import graphql.ErrorClassification
import graphql.ErrorType
import graphql.GraphQLError
import graphql.language.SourceLocation
import io.beampipe.server.StripeClient
import io.beampipe.server.auth.hashPassword
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.micronaut.context.annotation.Property
import org.apache.commons.validator.routines.EmailValidator
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import java.lang.RuntimeException
import java.security.SecureRandom
import java.security.spec.KeySpec
import java.util.Base64
import java.util.UUID
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import javax.inject.Inject


class AccountApi(@Property(name = "stripe.product", defaultValue = "price_1H9wLyKrGSqzIeMTIkqhJVDa") val stripeProduct: String) {
    @Inject
    lateinit var userApi: UserApi

    @Inject
    lateinit var stripeClient: StripeClient

    suspend fun subscribe(context: Context): String? {
        val stripeId = newSuspendedTransaction {
            val existingStripeId = Accounts
                        .slice(Accounts.stripeId)
                        .select { Accounts.id.eq(UUID.fromString(context.authentication!!.attributes["accountId"] as String)) }
                        .first()[Accounts.stripeId]

            if (existingStripeId == null) {
                val customer = Customer.create(
                        CustomerCreateParams.builder()
                                .build()
                )

                Accounts.update({
                    Accounts.id.eq(
                        UUID.fromString(context.authentication!!.attributes["accountId"] as String))
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

    suspend fun cancelSubscription(context: Context): String {
        return newSuspendedTransaction {
            val stripeId = Accounts
                    .slice(Accounts.stripeId)
                    .select { Accounts.id.eq(context.accountId) }
                    .first()[Accounts.stripeId]

            val subscriptionId = Customer.retrieve(stripeId)
                    .subscriptions.data[0].id

            val subscription = Subscription.retrieve(subscriptionId).cancel()

            Accounts.update({  Accounts.id.eq(UUID.fromString(context.authentication!!.attributes["accountId"] as String)) }) {
                it[Accounts.subscription] = "cancelled"
            }

            subscriptionId
        }
    }

    suspend fun createUser(context: Context, email: String, password: String, emailOk: Boolean) = newSuspendedTransaction {
        if (!EmailValidator.getInstance().isValid(email)) {
           throw CustomException("Email address is invalid")
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


    suspend fun deleteDomain(context: Context, id: UUID): UUID {
        if (context.authentication == null) {
            throw Exception("Not allowed")
        } else {
            newSuspendedTransaction {
                Domains.deleteWhere {
                    Domains.id.eq(id) and Domains.accountId.eq(context.accountId)
                }
            }

            return id
        }
    }

    suspend fun createOrUpdateDomain(context: Context, id: UUID?, domain: String, public: Boolean): UUID {
        if (context.authentication == null) {
            throw Exception("Not allowed")
        } else {
            val user = userApi.user(context)!!

            return newSuspendedTransaction {
                if (id != null) {
                    Domains.slice(Domains.id).select {
                        Domains.id.eq(id) and Domains.accountId.eq(context.accountId)
                    }.firstOrNull() ?: throw Exception("Domain not found")

                    Domains.update({ Domains.id.eq(id) }) {
                        it[Domains.domain] = domain
                        it[Domains.public] = public
                    }

                    id
                } else {
                    Domains.insertAndGetId {
                        it[accountId] = user.id
                        it[Domains.domain] = domain
                        it[Domains.public] = public
                    }.value
                }
            }
        }
    }
}