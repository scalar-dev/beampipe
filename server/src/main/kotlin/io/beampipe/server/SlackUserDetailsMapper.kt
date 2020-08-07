package io.beampipe.server

import com.slack.api.Slack
import com.slack.api.methods.request.team.TeamInfoRequest
import io.beampipe.server.db.Accounts
import io.micronaut.core.async.publisher.Publishers
import io.micronaut.security.authentication.AuthenticationResponse
import io.micronaut.security.authentication.UserDetails
import io.micronaut.security.oauth2.endpoint.authorization.state.State
import io.micronaut.security.oauth2.endpoint.token.response.OauthUserDetailsMapper
import io.micronaut.security.oauth2.endpoint.token.response.TokenResponse
import io.micronaut.security.utils.SecurityService
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.reactivestreams.Publisher
import java.util.Optional
import java.util.UUID
import java.util.concurrent.CompletableFuture
import javax.inject.Named
import javax.inject.Singleton

@Named("slack")
@Singleton
class SlackUserDetailsMapper(val securityService: SecurityService) : OauthUserDetailsMapper {
    override fun createAuthenticationResponse(tokenResponse: TokenResponse?, state: State?): Publisher<AuthenticationResponse> {
        val accountId = securityService.authentication
                .map { UUID.fromString(it.attributes["accountId"] as String?) }
                .orElse(null)

        val future: CompletableFuture<AuthenticationResponse> =
                Slack.getInstance().methodsAsync(tokenResponse!!.accessToken)
                        .teamInfo(TeamInfoRequest.builder().build())
                        .thenApply {teamInfo ->
                            if (accountId != null) {
                                transaction {
                                    val existing = Accounts.select {
                                        Accounts.id.eq(accountId)
                                    }.firstOrNull()

                                    if (existing != null) {
                                        Accounts.update({ Accounts.id.eq(accountId) }) {
                                            it[slackTeamId] = teamInfo.team.id
                                            it[slackToken] = tokenResponse.accessToken
                                        }
                                    }
                                }
                            }

                            // MASSIVE HACK
                            AuthenicationIsActuallyOkButWeDontWantToSetCookies()
                        }

        return Publishers.fromCompletableFuture(future)
    }

    override fun createUserDetails(tokenResponse: TokenResponse?): Publisher<UserDetails> {
        TODO("Not yet implemented")
    }

    class AuthenicationIsActuallyOkButWeDontWantToSetCookies : AuthenticationResponse {
        override fun getMessage(): Optional<String> = Optional.empty()
        override fun isAuthenticated() = true
        override fun getUserDetails(): Optional<UserDetails> = Optional.empty()
    }

}