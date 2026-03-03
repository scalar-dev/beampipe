package io.beampipe.server.slack

import com.slack.api.Slack
import com.slack.api.methods.request.chat.ChatPostMessageRequest
import com.slack.api.model.block.SectionBlock
import com.slack.api.model.block.composition.MarkdownTextObject
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.SlackSubscriptions
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import jakarta.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.future.await
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.concurrent.atomic.AtomicBoolean

inline fun <reified T> T.logger(): Logger {
    return LoggerFactory.getLogger(T::class.java)
}

@Singleton
class SlackNotifier {
    val LOG = logger()

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    data class Event(val domain: String, val event: String)
    data class Subscription(val channelId: String, val teamId: String, val token: String)

    var subscriptionCache = mapOf<String, Subscription>()
    val events: Channel<Event> = Channel(1024)
    val isDirty = AtomicBoolean(true)

    @PostConstruct
    fun start() {
        scope.launch {
            run()
        }
    }

    @PreDestroy
    fun stop() {
        scope.cancel()
    }

    suspend fun run() {
        LOG.info("Starting event loop")
        for (event in events) {
            val key = "${event.domain}_${event.event}"

            if (isDirty.get()) {
                LOG.info("Reloading subscription cache")
                subscriptionCache = newSuspendedTransaction {
                    SlackSubscriptions
                        .join(Domains, JoinType.INNER, SlackSubscriptions.domainId, Domains.id)
                        .join(Accounts, JoinType.INNER, Accounts.id, Domains.accountId)
                        .selectAll().where { Accounts.slackToken.isNotNull() }
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
