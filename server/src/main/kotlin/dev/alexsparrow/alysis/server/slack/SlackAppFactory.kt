package dev.alexsparrow.alysis.server.slack

import com.slack.api.Slack
import com.slack.api.bolt.App
import com.slack.api.bolt.AppConfig
import dev.alexsparrow.alysis.server.db.Domains
import dev.alexsparrow.alysis.server.db.SlackSubscriptions
import io.micronaut.context.annotation.Factory
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

import javax.inject.Singleton

@Factory
class AppFactory {
    @Singleton
    fun createAppConfig(): AppConfig {
        return AppConfig() // loads the env variables
    }

    @Singleton
    fun createApp(config: AppConfig?, slackNotifier: SlackNotifier): App {
        val app = App(config)

        app.command("/beampipe") { req, ctx ->
            val parts = req.payload.text.split("\\s+".toRegex())
            println(parts)

            if (parts[0] == "subscribe") {
                val domain = parts[1]
                val event = parts[2]

                transaction {
                    val domainId = Domains.slice(Domains.id)
                            .select { Domains.domain.eq(domain) }
                            .map { it[Domains.id] }
                            .firstOrNull()

                    if (domainId != null) {
                        val subscriptionId = SlackSubscriptions.insertAndGetId {
                            it[SlackSubscriptions.domainId] = domainId.value
                            it[eventType] = event
                            it[channelId] = req.payload.channelId
                            it[teamId] = req.payload.teamId
                        }

                        slackNotifier.isDirty = true
                        ctx.ack("Created subscription with id: $subscriptionId")
                    } else {
                        ctx.ack("Domain not found")
                    }
                }
            } else {
                ctx.ack("Unrecognised command")
            }
        }

        return app
    }
}