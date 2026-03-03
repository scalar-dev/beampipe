package io.beampipe.server.graphql

import io.beampipe.server.db.Domains
import io.beampipe.server.db.Goals
import com.expediagroup.graphql.generator.annotations.GraphQLIgnore
import io.beampipe.server.graphql.util.Context
import io.beampipe.server.graphql.util.CustomException
import org.jetbrains.exposed.exceptions.ExposedSQLException
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import java.util.UUID
import jakarta.inject.Inject
import jakarta.inject.Singleton

fun canonicaliseDomain(domain:String) = domain.trim().lowercase()

@Singleton
class DomainMutations(@Inject val accountQuery: AccountQuery) {
    suspend fun deleteDomain(@GraphQLIgnore context: Context, id: UUID): UUID = context.withAccountId {
        newSuspendedTransaction {
            Domains.deleteWhere {
                Domains.id.eq(id) and Domains.accountId.eq(context.accountId)
            }
        }

        id
    }

    suspend fun addGoal(@GraphQLIgnore context: Context, domainId: UUID, name: String, description: String?, eventType: String, path: String?) =
        context.withAccountId { _ ->
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

    suspend fun deleteGoal(@GraphQLIgnore context: Context, id: UUID) = context.withAccountId { _ ->
        newSuspendedTransaction {
            val goal = Goals.selectAll().where { Goals.id eq id }
                .firstOrNull()!!

            context.checkDomainAccess(goal[Goals.domain])

            Goals.deleteWhere { Goals.id eq id }
        }
    }

    suspend fun createOrUpdateDomain(@GraphQLIgnore context: Context, id: UUID?, domain: String, public: Boolean) =
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