package io.beampipe.server.db

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.timestamp

object ResetTokens : UUIDTable("reset_token") {
    val accountId =  uuid("account_id")
    val token = text("token")
    val isUsed = bool("is_used")
    val createdAt = timestamp("created_at")
}
