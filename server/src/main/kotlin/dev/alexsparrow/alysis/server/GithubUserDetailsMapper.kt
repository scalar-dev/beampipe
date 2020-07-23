package dev.alexsparrow.alysis.server

import dev.alexsparrow.alysis.server.db.Accounts
import io.micronaut.security.authentication.UserDetails
import io.micronaut.security.oauth2.endpoint.token.response.OauthUserDetailsMapper
import io.micronaut.security.oauth2.endpoint.token.response.TokenResponse
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.transaction
import org.reactivestreams.Publisher
import java.util.Collections
import java.util.UUID
import javax.inject.Named
import javax.inject.Singleton

@Named("github")
@Singleton
class GithubUserDetailsMapper(private val apiClient: GithubApiClient) : OauthUserDetailsMapper {
    override fun createUserDetails(tokenResponse: TokenResponse): Publisher<UserDetails> {
        return apiClient.getUser(TOKEN_PREFIX + tokenResponse.accessToken)!!
                .map { login ->
                    transaction {
                        val existingUser = Accounts
                                .slice(Accounts.id)
                                .select { Accounts.username.eq(stringLiteral(login.login)) }
                                .firstOrNull()

                        val accountId = if (existingUser == null) {
                            Accounts.insertAndGetId {
                                it[username] = login.login
                            }
                        } else {
                            existingUser[Accounts.id]
                        }

                        UserDetails(
                                login.login,
                                listOf(ROLE_GITHUB),
                                mapOf(
                                        OauthUserDetailsMapper.ACCESS_TOKEN_KEY to tokenResponse.accessToken,
                                        "accountId" to accountId.toString(),
                                        "email" to login.email
                                )
                        )
                    }
                }
    }

    companion object {
        const val TOKEN_PREFIX = "token "
        const val ROLE_GITHUB = "ROLE_GITHUB"
    }
}