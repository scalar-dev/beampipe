package io.beampipe.server.auth

import io.vertx.core.Handler
import io.vertx.ext.web.RoutingContext

class CookieToBearerTokenHandler : Handler<RoutingContext> {
    override fun handle(event: RoutingContext) {
        val cookie = event.request().getCookie("JWT")

        if (cookie != null && event.request().headers().getAll("Authorization").isEmpty()) {
            event.request().headers().set("Authorization", "Bearer ${cookie.value}")
        }
        event.next()
    }
}