package io.beampipe.server.graphql

import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.db.Goals
import io.beampipe.server.graphql.util.Context
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.util.UUID
import javax.inject.Singleton

@Singleton
class DomainQuery {
    data class Goal(
        val id: UUID,
        val domainId: UUID,
        val name: String,
        val description: String?,
        val eventType: String
    )

    data class DomainQ(val domainId: UUID) {
        fun id() = domainId
        suspend fun eventTypes(context: Context) = newSuspendedTransaction {
            context.checkDomainAccess(domainId)

            Events.slice(Events.type)
                .selectAll()
                .withDistinct(true)
                .map { it[Events.type] }
        }
    }

    suspend fun listGoals(context: Context, domainId: UUID): List<Goal> = context.withAccountId { accountId ->
        newSuspendedTransaction {
            context.checkDomainAccess(domainId)

            Goals.select {
                Goals.domain eq domainId
            }.map {
                Goal(
                    it[Goals.id].value,
                    it[Goals.domain],
                    it[Goals.name],
                    it[Goals.description],
                    it[Goals.eventType]
                )
            }
        }
    }

    suspend fun domain(context: Context, id: UUID?, domain: String?): DomainQ = context.withAccountId { accountId ->
        val domainId = id ?: newSuspendedTransaction {
            Domains.slice(Domains.id).select { Domains.domain eq domain!! }.firstOrNull()!![Domains.id].value
        }

        newSuspendedTransaction {
            context.checkDomainAccess(domainId)
        }

        DomainQ(domainId)
    }

}