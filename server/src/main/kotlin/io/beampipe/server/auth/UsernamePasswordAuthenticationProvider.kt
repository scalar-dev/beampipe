package io.beampipe.server.auth

import io.beampipe.server.db.Accounts
import io.micronaut.http.HttpRequest
import io.micronaut.security.authentication.AuthenticationRequest
import io.micronaut.security.authentication.AuthenticationResponse
import io.micronaut.security.authentication.provider.HttpRequestAuthenticationProvider
import jakarta.inject.Singleton
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.time.Instant
import java.util.Base64

fun canonicaliseEmail(email: String) = email.trim().lowercase()

@Singleton
class UsernamePasswordAuthenticationProvider :
    HttpRequestAuthenticationProvider<Any> {
    override fun authenticate(
        httpRequest: HttpRequest<Any>?,
        authenticationRequest: AuthenticationRequest<String, String>
    ): AuthenticationResponse {
        val email = canonicaliseEmail(authenticationRequest.identity)

        val account = transaction {
            Accounts.select(Accounts.email, Accounts.name, Accounts.id, Accounts.salt, Accounts.password)
                .where { Accounts.email.eq(email) }
                .firstOrNull()
        }

        if (account == null) {
            return AuthenticationResponse.failure()
        }

        transaction {
            Accounts.update({ Accounts.id.eq(account[Accounts.id]) }) {
                it[lastLoginAt] = Instant.now()
            }
        }

        val dec: Base64.Decoder = Base64.getDecoder()
        val salt = dec.decode(account[Accounts.salt])
        val hash = hashPassword(authenticationRequest.secret, salt)

        return if (hash == account[Accounts.password]) {
            AuthenticationResponse.success(
                account[Accounts.id].value.toString(),
                emptyList(),
                mapOf(
                    "accountId" to account[Accounts.id].value.toString(),
                    "name" to account[Accounts.name],
                    "email" to account[Accounts.email]
                )
            )
        } else {
            AuthenticationResponse.failure()
        }
    }
}
