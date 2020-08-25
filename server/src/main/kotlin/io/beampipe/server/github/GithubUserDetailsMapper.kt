package io.beampipe.server.github

import io.beampipe.server.db.Accounts
import io.micronaut.security.authentication.UserDetails
import io.micronaut.security.oauth2.endpoint.token.response.OauthUserDetailsMapper
import io.micronaut.security.oauth2.endpoint.token.response.TokenResponse
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.reactivestreams.Publisher
import java.time.Instant
import javax.inject.Named
import javax.inject.Singleton

@Named("github")
@Singleton
class GithubUserDetailsMapper(private val apiClient: GithubApiClient) : OauthUserDetailsMapper {
    override fun createUserDetails(tokenResponse: TokenResponse): Publisher<UserDetails> {
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
                UserDetails(
                    account[Accounts.id].toString(),
                    listOf(ROLE_GITHUB),
                    mapOf(
                        OauthUserDetailsMapper.ACCESS_TOKEN_KEY to tokenResponse.accessToken,
                        "accountId" to account[Accounts.id].toString(),
                        "email" to account[Accounts.email],
                        "name" to account[Accounts.name]
                    )
                )
            }
    }

    companion object {
        const val TOKEN_PREFIX = "token "
        const val ROLE_GITHUB = "ROLE_GITHUB"
    }
}