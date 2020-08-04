package dev.alexsparrow.alysis.server.graphql

import dev.alexsparrow.alysis.server.db.Accounts
import dev.alexsparrow.alysis.server.db.Domains
import dev.alexsparrow.alysis.server.db.Events
import dev.alexsparrow.alysis.server.db.util.TimeBucketGapFill
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.LongColumnType
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.less
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.castTo
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.time.Instant
import java.time.temporal.ChronoUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EventsApi {
    @Inject
    lateinit var userApi: UserApi

    data class Bucket(val time: Instant, val count: Long)
    data class Count(val key: String, val count: Long)

    data class Event(
            val type: String,
            val time: Instant,
            val source: String?,
            val city: String?,
            val country: String?
    )

    data class EventsQuery(
            private val domain: String,
            private val startTime: Instant,
            private val endTime: Instant
    ) {

        private fun preselect() = Events.domain.eq(domain).and(Events.time.greaterEq(startTime)) and Events.time.less(Instant.now())
        suspend fun bucketed(bucketDuration: String?) = newSuspendedTransaction {
           val timeBucket = TimeBucketGapFill(stringLiteral("1 ${bucketDuration ?: "day"}"), Events.time).alias("timeBucket")
           val count = Events.time.count().castTo<Long?>(LongColumnType())

           Events.slice(timeBucket, count)
                   .select { preselect() }
                   .groupBy(timeBucket)
                   .orderBy(timeBucket)
                   .map { Bucket(it[timeBucket], it[count] ?: 0) }
       }

        suspend fun count() = newSuspendedTransaction {
            Events
                    .select { preselect() }
                    .count()
        }

        private suspend fun topBy(column: Column<*>, n: Int?) = newSuspendedTransaction {
            Events.slice(column, column.count())
                    .select { preselect() }
                    .groupBy(column)
                    .orderBy(column.count(), SortOrder.DESC)
                    .limit(n ?: 10)
                    .map { Count(it[column].toString(), it[column.count()]) }
        }

        suspend fun topPages(n: Int?) = topBy(Events.path, n)

        suspend fun topReferrers(n: Int?) = topBy(Events.referrer, n)

        suspend fun topScreenSizes(n: Int?) = topBy(Events.device, n)

        suspend fun topCountries(n: Int?) = topBy(Events.country, n)

        suspend fun topDevices(n: Int?) = topBy(Events.deviceName, n)

        suspend fun topDeviceClasses(n: Int?) = topBy(Events.deviceClass, n)

        suspend fun topOperatingSystems(n: Int?) = topBy(Events.operationGystemName, n)

        suspend fun topAgents(n: Int?) = topBy(Events.agentName, n)

        suspend fun countUnique() = newSuspendedTransaction {
            Events
                    .slice(Events.userId)
                    .select { preselect() }
                    .withDistinct()
                    .count()
        }

        suspend fun events(domain: String, timePeriodStart: String?) = newSuspendedTransaction {
            Events
                    .select { preselect() }
                    .map { Event(it[Events.type], it[Events.time], it[Events.source_], it[Events.city], it[Events.country]) }
        }
    }

    private fun timePeriodToStartTime(timePeriodStart: String?) = when (timePeriodStart ?: "day") {
        "day" -> Instant.now().minus(1, ChronoUnit.DAYS)
        "hour" -> Instant.now().minus(1, ChronoUnit.HOURS)
        "week" -> Instant.now().minus(7, ChronoUnit.DAYS)
        "month" -> Instant.now().minus(28, ChronoUnit.DAYS)
        else -> throw Exception("Invalid time period")
    }

    suspend fun events(context: Context, domain: String, timePeriodStart: String?): EventsQuery = newSuspendedTransaction {
        val userId = userApi.user(context)?.id

        val matchingDomain = Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                .select {
                    Domains.domain.eq(domain) and (
                            if (userId != null) {
                                Domains.public or Accounts.id.eq(userId)
                            } else {
                                Domains.public
                            }
                            )
                }
                .firstOrNull()

        if (matchingDomain != null) {
            EventsQuery(domain, timePeriodToStartTime(timePeriodStart), Instant.now())
        } else {
            throw Exception("Not found")
        }
    }
}