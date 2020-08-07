package io.beampipe.server.slack

import com.slack.api.bolt.App
import com.slack.api.bolt.AppConfig
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.SlackSubscriptions
import io.micronaut.context.annotation.Factory
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.and
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

            if (parts[0] == "subscribe") {
                val domain = parts[1]
                val event = parts[2]

                transaction {
                    val domainId = Domains
                            .join(Accounts, JoinType.INNER, Accounts.id, Domains.accountId)
                            .slice(Domains.id)
                            .select { Domains.domain.eq(domain) and Accounts.slackTeamId.eq(req.payload.teamId)}
                            .map { it[Domains.id] }
                            .firstOrNull()

                    if (domainId != null) {
                        val subscriptionId = SlackSubscriptions.insertAndGetId {
                            it[SlackSubscriptions.domainId] = domainId.value
                            it[eventType] = event
                            it[channelId] = req.payload.channelId
                            it[teamId] = req.payload.teamId
                        }

                        slackNotifier.isDirty.set(true)
                        ctx.ack("Created subscription with id: $subscriptionId")
                    } else {
                        ctx.ack("Domain not found")
                    }
                }
            } else {
                ctx.ack("Usage: /beampipe subscribe <domain> <event>")
            }
        }

        return app
    }
}