package io.beampipe.server.auth

import io.vertx.core.AsyncResult
import io.vertx.core.Future
import io.vertx.core.Handler
import io.vertx.ext.auth.authentication.Credentials
import io.vertx.ext.auth.authentication.TokenCredentials
import io.vertx.ext.auth.jwt.JWTAuth
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.handler.impl.HttpStatusException
import io.vertx.ext.web.handler.impl.JWTAuthHandlerImpl

class PermissiveJWTAuthHandler(authProvider: JWTAuth) : JWTAuthHandlerImpl(authProvider) {
    override fun parseCredentials(context: RoutingContext, handler: Handler<AsyncResult<Credentials>>) {
        parseAuthorization(context, true) { parseAuthorization ->
            if (parseAuthorization.failed()) {
                handler.handle(Future.failedFuture(parseAuthorization.cause()));
            } else {
                handler.handle(Future.succeededFuture(TokenCredentials(parseAuthorization.result())));
            }
        }
    }

    override fun processException(ctx: RoutingContext?, exception: Throwable?) {
        if (exception != null) {
            if (exception is HttpStatusException) {
                val statusCode = exception.statusCode;

                if (statusCode != 401) {
                    super.processException(ctx, exception)
                } else {
                    postAuthentication(ctx)
                }
            }
        }
    }
}