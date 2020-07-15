package dev.alexsparrow.alysis.server.graphql

import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import dev.alexsparrow.alysis.server.db.Events
import dev.alexsparrow.alysis.server.db.TimeBucket
import org.jetbrains.exposed.sql.and
import java.time.Duration
import java.time.Instant
import java.time.Period
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalUnit
import javax.inject.Singleton

@Singleton
class EventsApi {
    data class Bucket(val time: Instant, val count: Long)

    data class Event(
            val type: String,
            val time: Instant,
            val source: String?,
            val city: String?,
            val country: String?
    )

    data class EventsQuery(
            private val domain: String,
            private val startTime: Instant
    ) {
       suspend fun bucketed(bucketDuration: String?) = newSuspendedTransaction {
           val timeBucket = TimeBucket(stringLiteral("1 ${bucketDuration ?: "day"}"), Events.time).alias("timeBucket")
           val count = Events.time.count()

           Events.slice(timeBucket, count)
                   .select {
                       Events.domain.eq(domain).and(Events.time.greaterEq(startTime))
                   }
                   .groupBy(timeBucket)
                   .orderBy(timeBucket)
                   .map { Bucket(it[timeBucket], it[count]) }
       }

        suspend fun count() = newSuspendedTransaction {
            Events
                    .select {
                        Events.domain.eq(domain).and(Events.time.greaterEq(startTime))
                    }
                    .count()
        }

        suspend fun countUnique() = newSuspendedTransaction {
            Events
                    .slice(Events.userId)
                    .select {
                        Events.domain.eq(domain).and(Events.time.greaterEq(startTime))
                    }
                    .withDistinct()
                    .count()
        }

        suspend fun events(domain: String, timePeriodStart: String?) = newSuspendedTransaction {
            Events
                    .select {
                        Events.domain.eq(domain).and(Events.time.greaterEq(startTime))
                    }
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
        return EventsQuery(domain, timePeriodToStartTime(timePeriodStart))
    }
}