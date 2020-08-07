package io.beampipe.server.db

import org.jetbrains.exposed.dao.id.UUIDTable

object Domains : UUIDTable("domain") {
    val domain = text("domain")
    val accountId = uuid("account_id")
    val public = bool("public")
}
