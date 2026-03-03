package io.beampipe.server.graphql

import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import com.expediagroup.graphql.generator.annotations.GraphQLIgnore
import io.beampipe.server.graphql.util.Context
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.exists
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import jakarta.inject.Singleton
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Singleton
class AccountQuery {
    data class User(val id: UUID, val email: String?, val name: String?)

    data class Quota(val current: Long, val max: Long)

    data class UserSettings(
        val email: String?,
        val name: String?,
        val accountId: UUID,
        val timeZone: String,
        val subscription: String,
        val domains: Quota,
        val pageViews: Quota,
        val visitors: Long
    )

    data class Domain(val id: UUID, val domain: String, val hasData: Boolean, val public: Boolean)

    fun user(@GraphQLIgnore context: Context) = if (context.authentication != null) {
        User(
            UUID.fromString(context.authentication.attributes["accountId"] as String),
            context.authentication.attributes["email"] as String?,
            context.authentication.attributes["name"] as String?
        )
    } else {
        null
    }

    fun maxPageViews(subscription: String): Long = when (subscription) {
        "basic" -> 10_000
        "pro" -> 100_000
        else -> 10_000
    }

    fun maxDomains(subscription: String): Long = when (subscription) {
        "basic" -> 5
        "pro" -> 20
        else -> 5
    }

    suspend fun settings(@GraphQLIgnore context: Context) = context.withAccountId { accountId ->
        newSuspendedTransaction {
            val domains = Domains
                .select(Domains.domain)
                .where { Domains.accountId eq accountId }
                .map { it[Domains.domain] }

            val pageViews = Events.selectAll().where {
                Events.time.greaterEq(Instant.now().minus(28, ChronoUnit.DAYS)) and (Events.domain inList domains)
            }
                .count()

            val visitors = Events
                .select(Events.userId)
                .where {
                    Events.time.greaterEq(Instant.now().minus(28, ChronoUnit.DAYS)) and (Events.domain inList domains)
                }
                .withDistinct(true)
                .count()

            Accounts.selectAll().where { Accounts.id.eq(accountId) }
                .map {
                    val subscription = it[Accounts.subscription]

                    UserSettings(
                        it[Accounts.email],
                        it[Accounts.name],
                        it[Accounts.id].value,
                        it[Accounts.timeZone],
                        it[Accounts.subscription],
                        Quota(domains.size.toLong(), maxDomains(subscription)),
                        Quota(pageViews, maxPageViews(subscription)),
                        visitors
                    )
                }
                .firstOrNull()
        }
    }

    suspend fun domains(@GraphQLIgnore context: Context): List<Domain> = newSuspendedTransaction {
        val user = user(context)

        if (user != null) {
            val hasData = exists(Events.selectAll().where { Events.domain.eq(Domains.domain) }).alias("hasData")

            Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                .select(Domains.id, Domains.domain, Domains.public, hasData)
                .where {
                    Accounts.id.eq(user.id)
                }
                .orderBy(Domains.domain)
                .map { Domain(it[Domains.id].value, it[Domains.domain], it[hasData], it[Domains.public]) }
        } else {
            emptyList()
        }
    }
}
