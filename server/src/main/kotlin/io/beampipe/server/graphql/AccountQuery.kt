package io.beampipe.server.graphql

import com.expediagroup.graphql.generator.annotations.GraphQLDescription
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.graphql.util.Context
import io.beampipe.server.graphql.util.LoginRequired
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.exists
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

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

    @LoginRequired
    @GraphQLDescription("Get details for the current user")
    fun user(context: Context) = if (context.user != null) {
        User(
            context.accountId,
            context.user.principal().getString("email"),
            context.user.principal().getString("name")
        )
    } else {
        null
    }

    private fun maxPageViews(subscription: String): Long = when (subscription) {
        "basic" -> 10_000
        "pro" -> 100_000
        else -> 10_000
    }

    private fun maxDomains(subscription: String): Long = when (subscription) {
        "basic" -> 5
        "pro" -> 20
        else -> 5
    }

    @LoginRequired
    suspend fun settings(context: Context) = context.withAccountId { accountId ->
        newSuspendedTransaction {
            val domains = Domains
                .slice(Domains.domain)
                .select { Domains.accountId eq accountId }
                .map { it[Domains.domain] }

            val pageViews = Events.select {
                Events.time.greaterEq(Instant.now().minus(28, ChronoUnit.DAYS)) and (Events.domain inList domains)
            }
                .count()

            val visitors = Events
                .slice( Events.userId )
                .select {
                    Events.time.greaterEq(Instant.now().minus(28, ChronoUnit.DAYS)) and (Events.domain inList domains)
                }
                .withDistinct(true)
                .count()

            Accounts.select { Accounts.id.eq(accountId) }
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

    @LoginRequired
    suspend fun domains(context: Context): List<Domain> = newSuspendedTransaction {
        val user = user(context)

        if (user != null) {
            val hasData = exists(Events.select { Events.domain.eq(Domains.domain) }).alias("hasData")

            Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                .slice(Domains.id, Domains.domain, Domains.public, hasData)
                .select {
                    Accounts.id.eq(user.id)
                }
                .orderBy(Domains.domain)
                .map { Domain(it[Domains.id].value, it[Domains.domain], it[hasData], it[Domains.public]) }
        } else {
            emptyList()
        }
    }
}