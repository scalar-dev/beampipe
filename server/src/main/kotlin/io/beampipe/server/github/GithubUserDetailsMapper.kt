package io.beampipe.server.github

import io.beampipe.server.db.Accounts
import io.micronaut.security.authentication.AuthenticationResponse
import io.micronaut.security.oauth2.endpoint.authorization.state.State
import io.micronaut.security.oauth2.endpoint.token.response.OauthAuthenticationMapper
import io.micronaut.security.oauth2.endpoint.token.response.TokenResponse
import io.reactivex.rxjava3.core.Flowable
import jakarta.inject.Named
import jakarta.inject.Singleton
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.reactivestreams.Publisher
import java.time.Instant

@Named("github")
@Singleton
class GithubUserDetailsMapper(private val apiClient: GithubApiClient) : OauthAuthenticationMapper {
    companion object {
        const val TOKEN_PREFIX = "token "
        const val ROLE_GITHUB = "ROLE_GITHUB"
    }

    override fun createAuthenticationResponse(tokenResponse: TokenResponse?, state: State?): Publisher<AuthenticationResponse> {
        if (tokenResponse == null) {
            return Flowable.empty()
        }

        return apiClient.getUser(TOKEN_PREFIX + tokenResponse.accessToken)!!
                .map { login ->
                    val account = transaction {
                        val existingUser = Accounts
                                .slice(Accounts.id)
                                .select { Accounts.githubUserId.eq(stringLiteral(login.id.toString())) }
                                .firstOrNull()

                        val accountId = if (existingUser == null) {
                            Accounts.insertAndGetId {
                                it[githubUserId] = login.id.toString()
                                it[email] = login.email
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
                    AuthenticationResponse.success(
                            account[Accounts.id].toString(),
                            listOf(ROLE_GITHUB),
                            mapOf(
                                    OauthAuthenticationMapper.ACCESS_TOKEN_KEY to tokenResponse.accessToken,
                                    "accountId" to account[Accounts.id].toString(),
                                    "email" to account[Accounts.email],
                                    "name" to account[Accounts.name]
                            )
                    )
                }
    }
}