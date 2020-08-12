package io.beampipe.server.graphql

import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.db.util.TimeBucketGapFill
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
    data class Count(val key: String?, val count: Long)

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
            private val comparisonStartTime: Instant,
            private val endTime: Instant
    ) {
        private fun preselect() = Events.domain.eq(domain).and(Events.time.greaterEq(startTime)) and Events.time.less(endTime)
        private fun preselectPreviousPeriod() = Events.domain.eq(domain).and(Events.time.greaterEq(comparisonStartTime)) and Events.time.less(startTime)

        suspend fun bucketed(bucketDuration: String?) = newSuspendedTransaction {
           val timeBucket = TimeBucketGapFill(stringLiteral("1 ${bucketDuration ?: "day"}"), Events.time).alias("timeBucket")
           val count = Events.time.count().castTo<Long?>(LongColumnType())

           Events.slice(timeBucket, count)
                   .select { preselect() }
                   .groupBy(timeBucket)
                   .orderBy(timeBucket)
                   .map {
                       Bucket(it[timeBucket], it[count] ?: 0)
                   }
       }

        suspend fun count() = newSuspendedTransaction {
            Events
                    .select { preselect() }
                    .count()
        }

        suspend fun previousCount() = newSuspendedTransaction {
            Events.select { preselectPreviousPeriod() }
                    .count()
        }

        private suspend fun topBy(column: Column<*>, n: Int?) = newSuspendedTransaction {
            Events.slice(column, column.count())
                    .select { preselect() }
                    .groupBy(column)
                    .having { column.count().greaterEq(1L) }
                    .orderBy(column.count(), SortOrder.DESC)
                    .limit(n ?: 10)
                    .map { Count(it[column]?.toString() ?: null, it[column.count()]) }
        }

        suspend fun topPages(n: Int?) = topBy(Events.path, n)

        suspend fun topSources(n: Int?) = topBy(Events.sourceClean, n)

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

        suspend fun previousCountUnique() = newSuspendedTransaction {
            Events
                    .slice(Events.userId)
                    .select { preselectPreviousPeriod() }
                    .withDistinct()
                    .count()
        }


//        suspend fun events() = newSuspendedTransaction {
//            Events
//                    .select { preselect() }
//                    .map { Event(it[Events.type], it[Events.time], it[Events.source_], it[Events.city], it[Events.country]) }
//        }
    }

    private fun timePeriodToStartTime(origin: Instant, timePeriodStart: String?) = when (timePeriodStart ?: "day") {
        "day" -> origin.minus(1, ChronoUnit.DAYS)
        "hour" -> origin.minus(1, ChronoUnit.HOURS)
        "week" -> origin.minus(7, ChronoUnit.DAYS)
        "month" -> origin.minus(28, ChronoUnit.DAYS)
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
            val startTime = timePeriodToStartTime(Instant.now(), timePeriodStart)
            EventsQuery(domain, startTime, timePeriodToStartTime(startTime, timePeriodStart), Instant.now())
        } else {
            throw Exception("Not found")
        }
    }
}