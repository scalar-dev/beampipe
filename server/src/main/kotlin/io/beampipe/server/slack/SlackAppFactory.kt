package io.beampipe.server.slack

import com.slack.api.bolt.App
import com.slack.api.bolt.AppConfig
import com.slack.api.bolt.context.builtin.SlashCommandContext
import com.slack.api.bolt.request.builtin.SlashCommandRequest
import com.slack.api.bolt.response.Response
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.SlackSubscriptions
import io.micronaut.context.annotation.Factory
import io.micronaut.context.annotation.Property
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import javax.inject.Inject

import javax.inject.Singleton

@Factory
class AppFactory(@Inject val slackNotifier: SlackNotifier) {
    @Singleton
    fun createAppConfig(): AppConfig {
        return AppConfig() // loads the env variables
    }

    private fun getDomainId(domain: String, teamId: String) = Domains
        .join(Accounts, JoinType.INNER, Accounts.id, Domains.accountId)
        .slice(Domains.id)
        .select { Domains.domain.eq(domain) and Accounts.slackTeamId.eq(teamId) }
        .map { it[Domains.id] }
        .firstOrNull()

    private fun getExistingSubscription(domainId: UUID, channelId: String) = SlackSubscriptions
        .select {
            SlackSubscriptions.domainId.eq(domainId) and
                    SlackSubscriptions.channelId.eq(channelId) and
                    SlackSubscriptions.subscriptionType.eq("summary")
        }
        .map { it[SlackSubscriptions.id] }
        .firstOrNull()

    private fun subscribe(parts: List<String>, req: SlashCommandRequest, ctx: SlashCommandContext): Response {
        val domain = parts[1]
        val event = parts[2]

        return transaction {
            val domainId = getDomainId(domain, req.payload.teamId)

            if (domainId != null) {
                val subscriptionId = SlackSubscriptions.insertAndGetId {
                    it[SlackSubscriptions.domainId] = domainId.value
                    it[eventType] = event
                    it[subscriptionType] = "event"
                    it[channelId] = req.payload.channelId
                    it[teamId] = req.payload.teamId
                }

                slackNotifier.isDirty.set(true)
                ctx.ack("Created subscription with id: $subscriptionId")
            } else {
                ctx.ack("Domain not found")
            }
        }
    }

    private fun subscribeSummary(parts: List<String>, req: SlashCommandRequest, ctx: SlashCommandContext): Response =
        transaction {
            val domain = parts[1]
            val domainId = getDomainId(domain, req.payload.teamId)

            if (domainId != null) {
                val subscriptionId = getExistingSubscription(domainId.value, req.payload.channelId)

                if (subscriptionId != null) {
                    ctx.ack("You are already subscribed to summary reports for this domain in this channel")
                } else {

                    SlackSubscriptions.insertAndGetId {
                        it[SlackSubscriptions.domainId] = domainId.value
                        it[subscriptionType] = "summary"
                        it[subscriptionCron] = "0 18 * *"
                        it[channelId] = req.payload.channelId
                        it[teamId] = req.payload.teamId
                    }

                    ctx.ack("Summary reports subscribed")
                }
            } else {
                ctx.ack("Domain not found")
            }
    }
    @Singleton
    fun createApp(config: AppConfig?, @Property(name="slack.command.name", defaultValue = "/beampipe") commandName: String): App {
        val app = App(config)

        app.command(commandName) { req, ctx ->
            val parts = req.payload.text.split("\\s+".toRegex())

            when (parts[0]) {
                "subscribe" -> subscribe(parts, req, ctx)
                "summary" -> subscribeSummary(parts, req, ctx)
                else -> ctx.ack("Usage: /beampipe subscribe <domain> <event>")
            }
        }

        return app
    }
}