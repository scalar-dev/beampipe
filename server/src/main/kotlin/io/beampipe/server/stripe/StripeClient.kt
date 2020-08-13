package io.beampipe.server.stripe

import com.stripe.Stripe
import com.stripe.model.Customer
import com.stripe.model.Product
import com.stripe.model.checkout.Session
import io.beampipe.server.db.Accounts
import io.micronaut.context.annotation.Property
import io.micronaut.http.HttpResponse
import io.micronaut.http.MutableHttpResponse
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.QueryValue
import io.micronaut.security.annotation.Secured
import io.micronaut.security.rules.SecurityRule
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.net.URI
import javax.inject.Singleton

@Singleton
@Controller("/stripe")
@Secured(SecurityRule.IS_ANONYMOUS)
class StripeClient(@Property(name = "stripe.key") val apiKey: String) {
    init {
        Stripe.apiKey = apiKey
    }

    @Get
    fun complete(@QueryValue("sessionId") sessionId: String): MutableHttpResponse<String>? {
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

        return HttpResponse.redirect<String>(URI.create("/settings"))
    }

}