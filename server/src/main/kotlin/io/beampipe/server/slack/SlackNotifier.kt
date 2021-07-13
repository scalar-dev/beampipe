package io.beampipe.server.slack

import com.slack.api.Slack
import com.slack.api.methods.request.chat.ChatPostMessageRequest
import com.slack.api.model.block.SectionBlock
import com.slack.api.model.block.composition.MarkdownTextObject
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.SlackSubscriptions
import io.vertx.kotlin.coroutines.CoroutineVerticle
import io.vertx.kotlin.coroutines.dispatcher
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.future.await
import kotlinx.coroutines.launch
import org.apache.logging.log4j.LogManager
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.util.concurrent.atomic.AtomicBoolean

class SlackNotifier: CoroutineVerticle() {
    val LOG = LogManager.getLogger()

    data class Event(val domain: String, val event: String)
    data class Subscription(val channelId: String, val teamId: String, val token: String)

    var subscriptionCache = mapOf<String, Subscription>()
    val events: Channel<Event> = Channel(1024)
    val isDirty = AtomicBoolean(true)

    override suspend fun start() {
        LOG.info("Starting event loop")

        vertx.setPeriodic(10 * 60 * 1000) {
            GlobalScope.launch(vertx.dispatcher()) {
                SlackReportScheduler().run()
            }
        }

        vertx.eventBus().consumer<Boolean>("slack_is_dirty") {
            isDirty.set(it.body())
        }

        for (event in events) {
            val key = "${event.domain}_${event.event}"

            if (isDirty.get()) {
                LOG.info("Reloading subscription cache")
                subscriptionCache = newSuspendedTransaction {
                    SlackSubscriptions
                        .join(Domains, JoinType.INNER, SlackSubscriptions.domainId, Domains.id)
                        .join(Accounts, JoinType.INNER, Accounts.id, Domains.accountId)
                        .select { Accounts.slackToken.isNotNull() }
                        .map {
                            "${it[Domains.domain]}_${it[SlackSubscriptions.eventType]}" to Subscription(
                                it[SlackSubscriptions.channelId],
                                it[SlackSubscriptions.teamId],
                                it[Accounts.slackToken]!!
                            )
                        }
                        .toMap()
                }
                isDirty.compareAndSet(true, false)
            }

            val subscription = subscriptionCache[key]

            if (subscription != null) {
                val response = Slack.getInstance()
                    .methodsAsync(subscription.token)
                    .chatPostMessage(
                        ChatPostMessageRequest.builder()
                            .channel(subscription.channelId)
                            .blocks(
                                listOf(
                                    SectionBlock.builder()
                                        .text(
                                            MarkdownTextObject(
                                                "Hi there. Your domain *${event.domain}* recorded a *${event.event}* event",
                                                false
                                            )
                                        )
                                        .build()
                                )
                            )
                            .build()
                    )
                    .await()

                if (response.error != null) {
                    LOG.error("Exception sending message: {}", response.error)
                }
            } else {
                LOG.debug("No subscription found: ${key}")
            }
        }
    }
}