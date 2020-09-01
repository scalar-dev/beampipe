package io.beampipe.server.db

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.`java-time`.timestamp

object SlackSubscriptions : UUIDTable("slack_subscription") {
    val domainId = uuid("domain_id")
    val eventType = text("event_type")
    val channelId = text("channel_id")
    val teamId = text("team_id")
    val subscriptionType = text("subscription_type")
    val subscriptionCron = text("subscription_cron")
    val lastDeliveryTime = timestamp("last_delivery_time").nullable()
}
