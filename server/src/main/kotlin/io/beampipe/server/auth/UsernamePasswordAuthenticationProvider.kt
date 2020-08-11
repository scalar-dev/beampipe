package io.beampipe.server.auth

import io.beampipe.server.db.Accounts
import io.micronaut.http.HttpRequest
import io.micronaut.security.authentication.AuthenticationFailed
import io.micronaut.security.authentication.AuthenticationProvider
import io.micronaut.security.authentication.AuthenticationRequest
import io.micronaut.security.authentication.AuthenticationResponse
import io.micronaut.security.authentication.UserDetails
import io.reactivex.Flowable
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.future.future
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.reactivestreams.Publisher
import java.util.Base64
import javax.inject.Singleton

@Singleton
class UsernamePasswordAuthenticationProvider: AuthenticationProvider {
    override fun authenticate(httpRequest: HttpRequest<*>?, authenticationRequest: AuthenticationRequest<*, *>?): Publisher<AuthenticationResponse> {
        return Flowable.fromFuture(
                GlobalScope.future {
                    val account = newSuspendedTransaction {
                        Accounts.slice(Accounts.email, Accounts.id, Accounts.salt, Accounts.password)
                                .select { Accounts.email.eq(authenticationRequest!!.identity as String) }
                                .firstOrNull()
                    }

                    if (account == null) {
                        AuthenticationFailed()
                    } else {
                        val dec: Base64.Decoder = Base64.getDecoder()
                        val salt = dec.decode(account[Accounts.salt])
                        val hash = hashPassword(authenticationRequest!!.secret as String, salt)

                        if (hash == account[Accounts.password]) {
                            UserDetails(account[Accounts.email], emptyList(), mapOf("accountId" to account[Accounts.id].value.toString()))
                        } else {
                            AuthenticationFailed()
                        }
                    }
                }
        )
    }

}