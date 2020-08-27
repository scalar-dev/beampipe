package io.beampipe.server.graphql.util

import com.expediagroup.graphql.execution.GraphQLContext
import io.beampipe.server.db.Domains
import io.micronaut.security.authentication.Authentication
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.select
import java.util.UUID

data class Context(val authentication: Authentication?, val host: String) : GraphQLContext {
    val accountId: UUID
        get() = UUID.fromString(authentication!!.attributes["accountId"] as String)

    suspend fun <T> withAccountId(block: suspend (accountId: UUID) -> T): T = block(accountId)

    suspend fun checkDomainAccess(domainId: UUID) = Domains.slice(Domains.id).select {
        Domains.id.eq(domainId) and Domains.accountId.eq(accountId)
    }.firstOrNull() ?: throw Exception("Domain not found")


}
