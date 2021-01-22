package io.beampipe.server.db

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.`java-time`.timestamp

object ResetTokens : UUIDTable("reset_token") {
    val accountId =  uuid("account_id")
    val token = text("token")
    val createdAt = timestamp("created_at")
}
