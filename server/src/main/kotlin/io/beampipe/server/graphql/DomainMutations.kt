package io.beampipe.server.graphql

import io.beampipe.server.db.Domains
import io.beampipe.server.db.Goals
import io.beampipe.server.graphql.util.Context
import io.beampipe.server.graphql.util.CustomException
import io.beampipe.server.graphql.util.LoginRequired
import org.jetbrains.exposed.exceptions.ExposedSQLException
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import java.util.UUID

fun canonicaliseDomain(domain:String) = domain.trim().toLowerCase()

class DomainMutations {
    @LoginRequired
    suspend fun deleteDomain(context: Context, id: UUID): UUID = context.withAccountId {
        newSuspendedTransaction {
            Domains.deleteWhere {
                Domains.id.eq(id) and Domains.accountId.eq(context.accountId)
            }
        }

        id
    }

    @LoginRequired
    suspend fun addGoal(context: Context, domainId: UUID, name: String, description: String?, eventType: String, path: String?) =
        context.withAccountId { accountId ->
            newSuspendedTransaction {
                context.checkDomainAccess(domainId)

                if (eventType == "page_view" && path.isNullOrBlank()) {
                    throw CustomException("page_view must have a path specified")
                }

                Goals.insertAndGetId {
                    it[Goals.domain] = domainId
                    it[Goals.name] = name
                    it[Goals.description] = description
                    it[Goals.eventType] = eventType
                    it[Goals.path] = path
                }.value
            }
        }

    @LoginRequired
    suspend fun deleteGoal(context: Context, id: UUID) = context.withAccountId { accountId ->
        newSuspendedTransaction {
            val goal = Goals.select { Goals.id eq id }
                .firstOrNull()!!

            context.checkDomainAccess(goal[Goals.domain])

            Goals.deleteWhere { Goals.id eq id }
        }
    }

    @LoginRequired
    suspend fun createOrUpdateDomain(context: Context, id: UUID? = null, domain: String, public: Boolean) =
        context.withAccountId { accountId ->
            newSuspendedTransaction {
                if (id != null) {
                    context.checkDomainAccess(id)

                    Domains.update({ Domains.id.eq(id) }) {
                        it[Domains.domain] = canonicaliseDomain(domain)
                        it[Domains.public] = public
                    }

                    id
                } else {
                    try {
                        Domains.insertAndGetId {
                            it[Domains.accountId] = accountId
                            it[Domains.domain] = canonicaliseDomain(domain)
                            it[Domains.public] = public
                        }.value

                    } catch (e: ExposedSQLException) {
                        if (e.sqlState == "23505") {
                            throw CustomException("This domain has already been configured (perhaps by another user)");
                        } else {
                            throw e
                        }
                    }
                }
            }
        }
}