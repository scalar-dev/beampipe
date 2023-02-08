package io.beampipe.server.slack

import com.slack.api.app_backend.interactive_components.response.ActionResponse
import com.slack.api.bolt.App
import com.slack.api.bolt.AppConfig
import com.slack.api.bolt.context.builtin.SlashCommandContext
import com.slack.api.bolt.request.builtin.SlashCommandRequest
import com.slack.api.bolt.response.Response
import com.slack.api.model.block.DividerBlock
import com.slack.api.model.block.SectionBlock
import com.slack.api.model.block.composition.MarkdownTextObject
import com.slack.api.model.block.composition.PlainTextObject
import com.slack.api.model.block.element.ButtonElement
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.SlackSubscriptions
import io.micronaut.context.annotation.Factory
import io.micronaut.context.annotation.Property
import jakarta.inject.Inject
import jakarta.inject.Singleton
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID


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

    private fun listSubscriptions(req: SlashCommandRequest, ctx:SlashCommandContext): Response =
        transaction {
            val unsubscribeSections = SlackSubscriptions.select {
                SlackSubscriptions.channelId eq (req.payload.channelId) and
                        (SlackSubscriptions.teamId eq req.payload.teamId)
            }
                .map {
                    val text = if (it[SlackSubscriptions.subscriptionType] == "summary") {
                        "Weekly summary"
                    } else {
                        "Events (type = ${it[SlackSubscriptions.eventType]})"
                    }
                    SectionBlock.builder()
                        .text(MarkdownTextObject(
                            text,
                            false
                        ))
                        .blockId(it[SlackSubscriptions.id].value.toString())
                        .accessory(ButtonElement.builder()
                            .text(
                                PlainTextObject("unsubscribe", false)
                            )
                            .actionId("unsubscribe")
                            .build()
                        )
                        .build()
                }

            ctx.ack(
                listOf(
                            SectionBlock.builder()
                                .text(MarkdownTextObject(
                                    "Here are your subscriptions for this channel:",
                                    false
                                ))
                                .build(),
                    DividerBlock.builder().build()
                ) + unsubscribeSections
            )
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
                        it[subscriptionCron] = "0 17 * * 5"
                        it[channelId] = req.payload.channelId
                        it[teamId] = req.payload.teamId
                    }

                    ctx.ack("Summary reports subscribed")
                }
            } else {
                ctx.ack("Domain not found")
            }
    }

    fun helpMessage(ctx: SlashCommandContext) = ctx.ack(
        listOf(
            SectionBlock.builder().text(MarkdownTextObject("I didn't understand that. Try:", false)).build(),
            DividerBlock.builder().build(),
            SectionBlock.builder().text(MarkdownTextObject("""To subscribe to an event: 
                            | `/beampipe subscribe <domain> <event_type>`
                        """.trimMargin(), false)).build(),
            SectionBlock.builder().text(MarkdownTextObject("""To subscribe to a weekly summary: 
                            | `/beampipe summary <domain>`
                        """.trimMargin(), false)).build(),
            SectionBlock.builder().text(MarkdownTextObject("""To view a list of subscriptions:
                            | `/beampipe list`
                        """.trimMargin(), false)).build(),
            SectionBlock.builder().text(MarkdownTextObject("""To view this help message:
                            | `/beampipe help`
                        """.trimMargin(), false)).build()
        )
    )

    @Singleton
    fun createApp(config: AppConfig?, @Property(name="slack.command.name", defaultValue = "/beampipe") commandName: String): App {
        val app = App(config)

        app.command(commandName) { req, ctx ->
            val parts = req.payload.text.split("\\s+".toRegex())

            when (parts[0]) {
                "subscribe" -> subscribe(parts, req, ctx)
                "list" -> listSubscriptions(req, ctx)
                "summary" -> subscribeSummary(parts, req, ctx)
                "help" -> helpMessage(ctx)
                else -> helpMessage(ctx)
            }
        }

        app.blockAction("unsubscribe") { req, context ->
            val action = req.payload.actions[0]

            val nDeleted = transaction {
                SlackSubscriptions.deleteWhere {
                    SlackSubscriptions.id eq UUID.fromString(action.blockId) and
                            (SlackSubscriptions.teamId eq req.payload.team.id) and
                            (SlackSubscriptions.channelId eq req.payload.channel.id)
                }
            }

            if (nDeleted >= 1) {
                context.respond(ActionResponse.builder().text("Unsubscribed").build())
            } else {
                context.respond("An error occurred")
            }

            context.ack()
        }

        return app
    }
}