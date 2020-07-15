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

    private fun timePeriodToStartTime(timePeriodStart: String?) = when (timePeriodStart ?: "day") {
        "day" -> Instant.now().minus(Period.ofDays(1))
        "hour" -> Instant.now().minus(Duration.ofHours(1))
        "week" -> Instant.now().minus(Period.ofWeeks(1))
        else -> throw Exception("Invalid time period")
    }

    suspend fun bucketEvents(domain: String, bucketDuration: String?, timePeriodStart: String?) = newSuspendedTransaction {
        val startTime = timePeriodToStartTime(timePeriodStart)
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

    suspend fun countUnique(domain: String, timePeriodStart: String?): Long = newSuspendedTransaction {
        val startTime = timePeriodToStartTime(timePeriodStart)
        Events
                .slice(Events.userId)
                .select {
                    Events.domain.eq(domain).and(Events.time.greaterEq(startTime))
                }
                .withDistinct()
                .count()
    }

    suspend fun count(domain: String, timePeriodStart: String?): Long = newSuspendedTransaction {
        val startTime = timePeriodToStartTime(timePeriodStart)
        Events
                .select {
                    Events.domain.eq(domain).and(Events.time.greaterEq(startTime))
                }
                .count()
    }

    suspend fun events(domain: String, timePeriodStart: String?) = newSuspendedTransaction {
        val startTime = timePeriodToStartTime(timePeriodStart)
        Events
                .select {
                    Events.domain.eq(domain).and(Events.time.greaterEq(startTime))
                }
                .map { Event(it[Events.type], it[Events.time], it[Events.source_], it[Events.city], it[Events.country]) }
    }

}