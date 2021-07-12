package io.beampipe.server.auth

import io.beampipe.server.db.Accounts
import io.vertx.core.AsyncResult
import io.vertx.core.Future
import io.vertx.core.Handler
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.ext.auth.User
import io.vertx.ext.auth.authentication.AuthenticationProvider
import io.vertx.kotlin.coroutines.dispatcher
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import java.time.Instant
import java.util.*

fun canonicaliseEmail(email: String) = email.trim().lowercase()

class UsernamePasswordAuthenticationProvider(private val vertx: Vertx) : AuthenticationProvider {
    override fun authenticate(credentials: JsonObject, resultHandler: Handler<AsyncResult<User>>) {
        val username = credentials.getString("username")
        val password = credentials.getString("password")

        val email = canonicaliseEmail(username)

        GlobalScope.launch(vertx.dispatcher()) {
            val account = newSuspendedTransaction {
                Accounts.slice(Accounts.email, Accounts.name, Accounts.id, Accounts.salt, Accounts.password)
                        .select { Accounts.email.eq(email) }
                        .firstOrNull()
            }

            if (account == null) {
                resultHandler.handle(Future.failedFuture("Invalid username or password"))
            } else {
                newSuspendedTransaction {
                        Accounts.update({ Accounts.id.eq(account[Accounts.id]) }) {
                            it[lastLoginAt] = Instant.now()
                        }
                    }

                    val dec: Base64.Decoder = Base64.getDecoder()
                    val salt = dec.decode(account[Accounts.salt])
                    val hash = hashPassword(password, salt)

                    if (hash == account[Accounts.password]) {
                        resultHandler.handle(Future.succeededFuture(User.create(
                            JsonObject()
                                .put("accountId", account[Accounts.id].value.toString())
                                .put("name", account[Accounts.name])
                                .put("email", account[Accounts.email])
                        )))
                    } else {
                        resultHandler.handle(Future.failedFuture("Invalid username or password"))
                    }
            }

        }

    }
}