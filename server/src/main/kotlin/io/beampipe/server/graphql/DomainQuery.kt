package io.beampipe.server.graphql

import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.db.Goals
import com.expediagroup.graphql.generator.annotations.GraphQLIgnore
import io.beampipe.server.graphql.util.Context
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.util.UUID
import jakarta.inject.Singleton

@Singleton
class DomainQuery {
    data class Goal(
        val id: UUID,
        val domainId: UUID,
        val name: String,
        val description: String?,
        val eventType: String
    )

    data class DomainQ(val domainId: UUID, val domain: String) {
        fun id() = domainId
        suspend fun eventTypes(@GraphQLIgnore context: Context) = newSuspendedTransaction {
            context.checkDomainAccess(domainId)

            Events.select(Events.type)
                .where { Events.domain eq domain }
                .withDistinct(true)
                .map { it[Events.type] }
        }
    }

    suspend fun listGoals(@GraphQLIgnore context: Context, domainId: UUID): List<Goal> = context.withAccountId { _ ->
        newSuspendedTransaction {
            context.checkDomainAccess(domainId)

            Goals.selectAll().where {
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

    suspend fun domain(@GraphQLIgnore context: Context, id: UUID?, domain: String?): DomainQ = context.withAccountId { _ ->
        val domainId = id ?: newSuspendedTransaction {
            Domains.select(Domains.id).where { Domains.domain eq domain!! }.firstOrNull()!![Domains.id].value
        }

        newSuspendedTransaction {
            context.checkDomainAccess(domainId)
        }

        DomainQ(domainId, domain!!)
    }

}
