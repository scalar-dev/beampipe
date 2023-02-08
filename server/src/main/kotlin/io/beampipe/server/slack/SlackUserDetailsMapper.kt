package io.beampipe.server.slack

import com.slack.api.Slack
import com.slack.api.methods.request.team.TeamInfoRequest
import io.beampipe.server.db.Accounts
import io.micronaut.core.async.publisher.Publishers
import io.micronaut.security.authentication.Authentication
import io.micronaut.security.authentication.AuthenticationResponse
import io.micronaut.security.oauth2.endpoint.authorization.state.State
import io.micronaut.security.oauth2.endpoint.token.response.OauthAuthenticationMapper
import io.micronaut.security.oauth2.endpoint.token.response.TokenResponse
import io.micronaut.security.utils.SecurityService
import jakarta.inject.Named
import jakarta.inject.Singleton
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.reactivestreams.Publisher
import java.util.Optional
import java.util.UUID
import java.util.concurrent.CompletableFuture

@Named("slack")
@Singleton
class SlackUserDetailsMapper(val securityService: SecurityService) : OauthAuthenticationMapper {
    override fun createAuthenticationResponse(
        tokenResponse: TokenResponse?,
        state: State?
    ): Publisher<AuthenticationResponse> {
        val accountId = securityService.authentication
            .map { UUID.fromString(it.attributes["accountId"] as String?) }
            .orElse(null)

        val future: CompletableFuture<AuthenticationResponse> =
            Slack.getInstance().methodsAsync(tokenResponse!!.accessToken)
                .teamInfo(TeamInfoRequest.builder().build())
                .thenApply { teamInfo ->
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

    class AuthenicationIsActuallyOkButWeDontWantToSetCookies : AuthenticationResponse {
        override fun getMessage(): Optional<String> = Optional.empty()
        override fun isAuthenticated() = true
        override fun getAuthentication(): Optional<Authentication> = Optional.empty()
    }

}