package io.beampipe.server.graphql

import com.expediagroup.graphql.execution.GraphQLContext
import io.micronaut.security.authentication.Authentication
import java.util.UUID

data class Context(val authentication: Authentication?, val host: String): GraphQLContext {
    val accountId: UUID
        get() = UUID.fromString(authentication!!.attributes["accountId"] as String)

    suspend fun <T> withAccountId(block: suspend (accountId: UUID) -> T): T
        = block(accountId)
}
