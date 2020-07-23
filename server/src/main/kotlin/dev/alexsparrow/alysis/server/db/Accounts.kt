package dev.alexsparrow.alysis.server.db

import org.jetbrains.exposed.dao.id.UUIDTable

object Accounts : UUIDTable("account") {
    val username = text("username")
}
