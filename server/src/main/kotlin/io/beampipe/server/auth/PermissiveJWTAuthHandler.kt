package io.beampipe.server.auth

import io.vertx.ext.auth.jwt.JWTAuth
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.handler.HttpException
import io.vertx.ext.web.handler.impl.JWTAuthHandlerImpl

class PermissiveJWTAuthHandler(authProvider: JWTAuth) : JWTAuthHandlerImpl(authProvider, "beampipe") {
    override fun processException(ctx: RoutingContext?, exception: Throwable?) {
        if (exception != null) {
            if (exception is HttpException) {
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