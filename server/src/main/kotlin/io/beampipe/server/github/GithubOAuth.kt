package io.beampipe.server.github

import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.ext.auth.oauth2.OAuth2Auth
import io.vertx.ext.auth.oauth2.OAuth2FlowType
import io.vertx.ext.auth.oauth2.OAuth2Options
import io.vertx.ext.web.Router

import io.beampipe.server.db.Accounts
import io.vertx.core.http.Cookie
import io.vertx.ext.auth.jwt.JWTAuth
import io.vertx.kotlin.coroutines.dispatcher
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import java.time.Instant

class GithubOAuth(private val vertx: Vertx, private val jwtAuth: JWTAuth) {
    private val router = Router.router(vertx)

    init {
        val oauth2 = OAuth2Auth.create(vertx, OAuth2Options()
        .setFlow(OAuth2FlowType.AUTH_CODE)
            .setClientId("YOUR_CLIENT_ID")
            .setClientSecret("YOUR_CLIENT_SECRET")
            .setSite("https://github.com/login")
            .setTokenPath("/oauth/access_token")
            .setAuthorizationPath("/oauth/authorize")
        )

        router.route("/oauth/github/login")
            .handler { rc ->
                val uri = oauth2.authorizeURL(JsonObject()
                    .put("redirect_uri", "http://localhost:8080/callback")
                    .put("scope", "notifications")
                    .put("state", "3(#0/!~"));
                rc.response().putHeader("location", uri)
                    .setStatusCode(302)
                    .end()
            }

        router.route("/oauth/github/callback")
            .handler { rc ->
                oauth2.authenticate(
                    JsonObject()
                        .put("code", rc.queryParam("code").first())
                        .put("redirect_uri", "http://localhost:8080/callback")
                )
                    .onSuccess { user ->
                        GlobalScope.launch(vertx.dispatcher()) {
                            val githubUser = GithubApiClient(vertx).getUser(user.principal().getString("access_token"))!!

                            val account = newSuspendedTransaction {
                                val existingUser = Accounts
                                    .slice(Accounts.id)
                                    .select { Accounts.githubUserId.eq(stringLiteral(githubUser.id.toString())) }
                                    .firstOrNull()

                                val accountId = if (existingUser == null) {
                                    Accounts.insertAndGetId {
                                        it[githubUserId] = githubUser.id.toString()
                                        it[email] = githubUser.email.toString()
                                    }
                                } else {
                                    Accounts.update({ Accounts.id.eq(existingUser[Accounts.id]) }) {
                                        it[lastLoginAt] = Instant.now()
                                    }
                                    existingUser[Accounts.id]
                                }

                                Accounts.select { Accounts.id.eq(accountId) }
                                    .firstOrNull()!!
                            }

                            rc.response()
                                .addCookie(
                                    Cookie.cookie("JWT", jwtAuth.generateToken(
                                        JsonObject(
                                            mapOf(
                                                "accountId" to account[Accounts.id],
                                                "name" to account[Accounts.name],
                                                "email" to account[Accounts.email]
                                            )
                                        )
                                    ))
                                        .setSecure(true)
                                        .setHttpOnly(true)
                                )
                                .setStatusCode(302)
                                .putHeader("location", "/")
                                .end()
                        }
                    }
                    .onFailure { err -> }
            }
    }

    companion object {
        const val TOKEN_PREFIX = "token "
        const val ROLE_GITHUB = "ROLE_GITHUB"
    }
}