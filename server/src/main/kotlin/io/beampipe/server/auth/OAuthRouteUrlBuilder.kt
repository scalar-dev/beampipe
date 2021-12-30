package io.beampipe.server.auth

import io.micronaut.context.annotation.Replaces
import io.micronaut.http.HttpRequest
import io.micronaut.security.oauth2.url.DefaultOauthRouteUrlBuilder
import io.micronaut.security.oauth2.url.OauthRouteUrlBuilder
import org.apache.hc.core5.net.URIBuilder
import java.net.URI
import java.net.URL
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
@Replaces(DefaultOauthRouteUrlBuilder::class)
class OAuthRouteUrlBuilder(@Inject val defaultOauthRouteUrlBuilder: DefaultOauthRouteUrlBuilder) : OauthRouteUrlBuilder {
    override fun buildUrl(current: HttpRequest<*>?, path: String?): URL {
        return defaultOauthRouteUrlBuilder.buildUrl(current, path)
    }

    override fun buildLoginUrl(originating: HttpRequest<*>?, providerName: String?): URL {
        return  defaultOauthRouteUrlBuilder.buildLoginUrl(originating, providerName)
    }

    override fun buildCallbackUrl(originating: HttpRequest<*>?, providerName: String?): URL {
        val default = defaultOauthRouteUrlBuilder.buildCallbackUrl(originating, providerName)
        return URL("https", "app.beampipe.io", default.port, default.file)
    }

    override fun buildLoginUri(providerName: String?): URI {
        return defaultOauthRouteUrlBuilder.buildLoginUri(providerName)
    }

    override fun buildCallbackUri(providerName: String?): URI {
        val default = defaultOauthRouteUrlBuilder.buildCallbackUri(providerName)
        return URIBuilder(default).setScheme("https").setHost("app.beampipe.io").build()
    }
}