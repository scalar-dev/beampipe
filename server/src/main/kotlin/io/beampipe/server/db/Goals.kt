package io.beampipe.server.db

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.`java-time`.timestamp

object Goals : UUIDTable("goal") {
    val domain = uuid("domain_id")
    val name = text("name")
    val description = text("description").nullable()
    val eventType = text("event_type")
    val path = text("path").nullable()
    val createdAt = timestamp("created_at")
}
