package dev.alexsparrow.alysis.server.graphql

import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import dev.alexsparrow.alysis.server.db.Events
import dev.alexsparrow.alysis.server.db.TimeBucket
import java.time.Duration
import java.time.Instant
import javax.inject.Singleton

@Singleton
class EventsApi {
    data class Bucket(val time: Instant, val count: Long)

    data class Event(
            val type: String,
            val time: Instant,
            val source: String?,
            val city: String?
    )

    suspend fun bucketEvents(domain: String, bucketDuration: String?) = newSuspendedTransaction {
        val timeBucket = TimeBucket(stringLiteral("1 ${bucketDuration ?: "day"}"), Events.time).alias("timeBucket")
        val count = Events.time.count()

        Events.slice(timeBucket, count)
                .select {
                   Events.domain.eq(domain)
                }
                .groupBy(timeBucket)
                .orderBy(timeBucket)
                .map { Bucket(it[timeBucket], it[count]) }
    }

    suspend fun events(since: Instant?) = newSuspendedTransaction {
        Events
                .select {
                    Events.time.greaterEq(since ?: Instant.now().minus(Duration.ofDays(30)))
                }
                .map { Event(it[Events.type], it[Events.time], it[Events.source_], it[Events.city]) }
    }

}