package dev.alexsparrow.alysis.server.graphql

import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import dev.alexsparrow.alysis.server.db.Events
import dev.alexsparrow.alysis.server.db.TimeBucket
import dev.alexsparrow.alysis.server.db.TimeBucketGapFill
import org.jetbrains.exposed.sql.LongColumnType
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.less
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.castTo
import org.jetbrains.exposed.sql.function
import java.time.Duration
import java.time.Instant
import java.time.Period
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalUnit
import javax.inject.Singleton

@Singleton
class EventsApi {
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

        suspend fun topPages(n: Int?) = newSuspendedTransaction {
            Events.slice(Events.path, Events.path.count())
                    .select { preselect() }
                    .groupBy(Events.path)
                    .orderBy(Events.path.count(), SortOrder.DESC)
                    .limit(n ?: 10)
                    .map { Count(it[Events.path], it[Events.path.count()]) }
        }

        suspend fun topReferrers(n: Int?) = newSuspendedTransaction {
            Events.slice(Events.referrer, Events.referrer.count())
                    .select { preselect() }
                    .groupBy(Events.referrer)
                    .orderBy(Events.referrer.count(), SortOrder.DESC)
                    .limit(n ?: 10)
                    .map { Count(it[Events.referrer], it[Events.referrer.count()]) }
        }


        suspend fun topDevices(n: Int?) = newSuspendedTransaction {
            Events.slice(Events.device, Events.device.count())
                    .select { preselect() }
                    .groupBy(Events.device)
                    .orderBy(Events.device.count(), SortOrder.DESC)
                    .limit(n ?: 10)
                    .map { Count(it[Events.device], it[Events.device.count()]) }
        }

        suspend fun topCountries(n: Int?) = newSuspendedTransaction {
            Events.slice(Events.country, Events.id.count())
                    .select { preselect() }
                    .groupBy(Events.country)
                    .orderBy(Events.id.count(), SortOrder.DESC)
                    .limit(n ?: 10)
                    .map { Count(it[Events.country] ?: "unknown", it[Events.id.count()]) }
        }

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
        else -> throw Exception("Invalid time period")
    }

    fun events(domain: String, timePeriodStart: String?): EventsQuery {
        return EventsQuery(domain, timePeriodToStartTime(timePeriodStart), Instant.now())
    }
}