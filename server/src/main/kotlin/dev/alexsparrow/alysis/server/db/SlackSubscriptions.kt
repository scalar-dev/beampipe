package dev.alexsparrow.alysis.server.db

import org.jetbrains.exposed.dao.id.UUIDTable

object SlackSubscriptions : UUIDTable("slack_subscription") {
    val domainId = uuid("domain_id")
    val eventType = text("event_type")
    val channelId = text("channel_id")
    val teamId = text("team_id")
}
