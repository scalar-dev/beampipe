package io.beampipe.server.stripe

import com.stripe.Stripe

import com.stripe.model.Customer
import com.stripe.model.Product
import com.stripe.model.checkout.Session
import io.beampipe.server.db.Accounts
import io.vertx.core.Handler
import io.vertx.ext.web.RoutingContext
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

class StripeHandler(private val apiKey: String) : Handler<RoutingContext> {
    override fun handle(event: RoutingContext) {
        val sessionId = event.queryParam("sessionId").first()
        val session = Session.retrieve(sessionId)
        val customer = Customer.retrieve(session.customer)
        val product = Product.retrieve(customer.subscriptions.data[0].items.data[0].price.product)

        if (product.name == "Pro plan") {
            transaction {
                Accounts.update({ Accounts.stripeId.eq(customer.id) }) {
                    it[Accounts.subscription] = "pro"
                }
            }
        }

        event.response().putHeader("location", "/settings").setStatusCode(302).end()
    }
}