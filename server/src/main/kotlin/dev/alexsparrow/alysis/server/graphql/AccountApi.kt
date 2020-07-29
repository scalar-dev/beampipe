package dev.alexsparrow.alysis.server.graphql

import com.stripe.model.Customer
import com.stripe.model.Subscription
import com.stripe.model.checkout.Session
import com.stripe.param.CustomerCreateParams
import com.stripe.param.checkout.SessionCreateParams
import dev.alexsparrow.alysis.server.StripeClient
import dev.alexsparrow.alysis.server.db.Accounts
import dev.alexsparrow.alysis.server.db.Domains
import io.micronaut.context.annotation.Property
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.util.UUID
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

                Accounts.update({Accounts.id.eq(
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
                    .select { Accounts.id.eq(UUID.fromString(context.authentication!!.attributes["accountId"] as String)) }
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

    suspend fun createDomain(context: Context, domain: String, public: Boolean): UUID {
        if (context.authentication == null) {
            throw Exception("Not allowed")
        } else {
            val user = userApi.user(context)!!

            return newSuspendedTransaction {
                Domains.insertAndGetId {
                    it[accountId] = user.id
                    it[Domains.domain] = domain
                    it[Domains.public] = public
                }
            }.value
        }
    }
}