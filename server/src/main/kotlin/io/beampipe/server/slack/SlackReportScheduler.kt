package io.beampipe.server.slack

import com.slack.api.Slack
import com.slack.api.methods.request.chat.ChatPostMessageRequest
import com.slack.api.model.block.SectionBlock
import com.slack.api.model.block.composition.MarkdownTextObject
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.SlackSubscriptions
import io.beampipe.server.graphql.EventQuery
import io.beampipe.server.graphql.EventStats
import io.micronaut.scheduling.annotation.Scheduled
import io.micronaut.scheduling.cron.CronExpression
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.future.await
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import java.text.DecimalFormat
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.UUID
import javax.inject.Singleton


@Singleton
class SlackReportScheduler() {
    val LOG = logger()

    private fun block(text: String) = SectionBlock.builder()
        .text(
            MarkdownTextObject(
                text,
                false
            )
        )
        .build()

    private fun computeChange(current: Double?, prev: Double?): Double? {
        if (prev == null || current == null || prev == 0.0) {
            return null
        } else {
            return (current - prev) / prev
        }
    }


    private fun computeChange(current: Long?, prev: Long?): Double? {
        if (prev == null || current == null || prev == 0L) {
            return null
        } else {
            return (current - prev).toDouble() / prev
        }
    }

    private fun formatChange(change: Double?): String {
        if (change == null) {
            return ""
        } else {
            val df = DecimalFormat("##.#%")
            val formattedPercent = df.format(change)

            if (change > 0) {
                return ":arrow_up: $formattedPercent"
            } else {
                return ":arrow_down: $formattedPercent"
            }
        }
    }

    private fun formatDouble(value: Double?): String {
        if (value == null) {
            return "-"
        } else {
            val df = DecimalFormat("#.#")
            return df.format(value)
        }
    }


    private fun formatPercentage(value: Double?): String {
        if (value == null) {
            return "-"
        } else {
            val df = DecimalFormat("##.#%")
            return df.format(value)
        }
    }

    private suspend fun sendMessage(
        subscriptionId: UUID,
        domain: String,
        timeZone: ZoneId,
        slackToken: String,
        channelId: String
    ) {
        val timePeriod = EventQuery.TimePeriod("day", null, null)
        val report = EventStats(
            domain,
            timePeriod.toStartTime(),
            timePeriod.toEndTime(),
            timePeriod.toPreviousStartTime(),
            timeZone,
            emptyList(),
            false
        )

        val count = report.count()
        val bounceCount = report.bounceCount()
        val countUnique = report.countUnique()

        val prevCount = report.previousCount()
        val prevBounceCount = report.previousBounceCount()!!
        val prevCountUnique = report.previousCountUnique()!!

        val bounceRate = if (countUnique > 0) {
            bounceCount.toDouble() / countUnique
        } else {
            null
        }

        val prevBounceRate = if (prevCountUnique > 0) {
            prevBounceCount.toDouble() / prevCountUnique
        } else {
            null
        }

        val countChange = computeChange(count, prevCount)
        val countUniqueChange = computeChange(countUnique, prevCountUnique)
        val bounceRateChange = computeChange(bounceRate, prevBounceRate)

        val response = Slack.getInstance()
            .methodsAsync(slackToken)
            .chatPostMessage(
                ChatPostMessageRequest.builder()
                    .channel(channelId)
                    .blocks(
                        listOf(
                            SectionBlock.builder()
                                .text(
                                    MarkdownTextObject(
                                        "Hi there. Here is today's summary report for: $domain",
                                        false
                                    )
                                )
                                .build(),
                            block("*Page views*: $count ${formatChange(countChange)}"),
                            block("*Unique visitors*: $countUnique ${formatChange(countUniqueChange)}"),
                            block("*Bounce rate*: ${formatPercentage(bounceRate)} ${formatChange(bounceRateChange)}")
                        )
                    )
                    .build()
            )
            .await()

        if (response.error != null) {
            LOG.error("Exception sending message: {}", response.error)
        } else {
            SlackSubscriptions.update({ SlackSubscriptions.id eq subscriptionId }) {
                it[SlackSubscriptions.lastDeliveryTime] = Instant.now()
            }
        }
    }

    @Scheduled(fixedRate = "10m")
    fun run() = GlobalScope.launch(Dispatchers.IO) {
        newSuspendedTransaction {
            LOG.info("Checking for summary subscriptions")
            SlackSubscriptions
                .join(Domains, JoinType.INNER, SlackSubscriptions.domainId, Domains.id)
                .join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                .slice(
                    SlackSubscriptions.id,
                    SlackSubscriptions.channelId,
                    SlackSubscriptions.domainId,
                    SlackSubscriptions.teamId,
                    SlackSubscriptions.subscriptionCron,
                    SlackSubscriptions.lastDeliveryTime,
                    Domains.domain,
                    Accounts.timeZone,
                    Accounts.slackToken,
                    Accounts.createdAt
                )
                .select { SlackSubscriptions.subscriptionType eq "summary" }
                .forEach { subscription ->
                    val timeZone = ZoneId.of(subscription[Accounts.timeZone])
                    val currentTime = ZonedDateTime.now(timeZone)
                    val cron = CronExpression.create(subscription[SlackSubscriptions.subscriptionCron])
                    val lastDeliveryTime = subscription[SlackSubscriptions.lastDeliveryTime]?.atZone(timeZone)

                    val timeAfter = LocalDate.now().atStartOfDay().atZone(timeZone)

                    val nextTime = cron.nextTimeAfter(timeAfter)

                    if (lastDeliveryTime != null && Duration.between(lastDeliveryTime, nextTime).toHours() < 12) {
                        LOG.info(
                            "Skipping notification as it was sent recently: {}",
                            subscription[SlackSubscriptions.id]
                        )
                    } else if (Duration.between(currentTime, nextTime).abs().toHours() < 1) {
                        LOG.info("Sending notification for subscription: {}", subscription[SlackSubscriptions.id])

                        sendMessage(
                            subscription[SlackSubscriptions.id].value,
                            subscription[Domains.domain],
                            timeZone,
                            subscription[Accounts.slackToken]!!,
                            subscription[SlackSubscriptions.channelId]
                        )

                    } else {
                        LOG.info("Not sending report for ${subscription[SlackSubscriptions.id]} as it isn't scheduled until $nextTime (current time: $currentTime)")
                    }

                }
        }
    }
}