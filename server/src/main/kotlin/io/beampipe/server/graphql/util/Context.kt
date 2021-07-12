package io.beampipe.server.graphql.util

import com.expediagroup.graphql.generator.execution.GraphQLContext
import io.beampipe.server.db.Domains
import io.vertx.ext.auth.User
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.select
import java.util.UUID

data class Context(val user: User?, val host: String) : GraphQLContext {
    val accountId: UUID
        get() = UUID.fromString(user!!.principal().getString("accountId"))

    suspend fun <T> withAccountId(block: suspend (accountId: UUID) -> T): T = block(accountId)

    fun checkDomainAccess(domainId: UUID) = Domains.slice(Domains.id).select {
        Domains.id.eq(domainId) and Domains.accountId.eq(accountId)
    }.firstOrNull() ?: throw Exception("Domain not found")
}
