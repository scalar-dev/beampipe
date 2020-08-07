package io.beampipe.server.db

import io.beampipe.server.db.util.defaultObjectMapper
import io.beampipe.server.db.util.jsonb
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.`java-time`.timestamp

object Events : UUIDTable("event") {
    val time = timestamp("time")
    val type = varchar("type", 64)
    val city = varchar("city", 1024).nullable()
    val country = varchar("country", 1024).nullable()
    val domain = varchar("domain", 1024)
    val path = varchar("path", 1024)
    val userId = long("user_id")
    val device = varchar("device", 64)
    val referrer = varchar("referrer", 1024)
    val source_ = varchar("source", 1024).nullable()
    val userAgent = varchar("user_agent", 1024)
    val deviceName = text("device_name")
    val deviceClass = text("device_class")
    val operationGystemName = text("operating_system_name")
    val agentName = text("agent_name")
    val screenWidth = integer("screen_width")
    val data = jsonb("data", Map::class.java, defaultObjectMapper()).nullable()
}
