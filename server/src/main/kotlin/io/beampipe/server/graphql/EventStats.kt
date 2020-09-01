package io.beampipe.server.graphql

import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.db.Goals
import io.beampipe.server.db.util.AtTimeZone
import io.beampipe.server.db.util.TimeBucketGapFillStartEnd
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.LongColumnType
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder
import org.jetbrains.exposed.sql.`java-time`.timestampLiteral
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.castTo
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.countDistinct
import org.jetbrains.exposed.sql.not
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.sum
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset

data class EventStats(
    private val domain: String,
    private val startTime: Instant,
    private val endTime: Instant,
    private val comparisonStartTime: Instant?,
    private val timeZone: ZoneId
) {
    private fun SqlExpressionBuilder.preselect(periodStartTime: Instant, periodEndTime: Instant) = Events.domain.eq(domain) and
            Events.time.greaterEq(periodStartTime) and
            Events.time.less(periodEndTime)

    private fun timeBucket(bucketDuration: String?) = TimeBucketGapFillStartEnd(
        stringLiteral("1 ${bucketDuration ?: "day"}"),
        AtTimeZone(Events.time, stringLiteral(timeZone.id)),
        timestampLiteral(startTime),
        timestampLiteral(endTime)
    ).alias("time_bucket")

    suspend fun bucketed(bucketDuration: String?) = newSuspendedTransaction {
        val timeBucket = timeBucket(bucketDuration)
        val count = Events.time.count().castTo<Long?>(LongColumnType())

        Events.slice(timeBucket, count)
            .select { preselect(startTime, endTime) }
            .groupBy(timeBucket)
            .orderBy(timeBucket)
            .map {
                EventQuery.Bucket(it[timeBucket].atZone(timeZone).withZoneSameInstant(ZoneOffset.UTC), it[count] ?: 0)
            }
    }

    suspend fun bucketedUnique(bucketDuration: String?) = newSuspendedTransaction {
        val timeBucket = timeBucket(bucketDuration)
        val count = Events.userId.countDistinct().castTo<Long?>(LongColumnType())

        Events
            .slice(timeBucket, count)
            .select { preselect(startTime, endTime) }
            .groupBy(timeBucket)
            .orderBy(timeBucket)
            .map {
                EventQuery.Bucket(it[timeBucket].atZone(timeZone).withZoneSameInstant(ZoneOffset.UTC), it[count] ?: 0)
            }
    }


    suspend fun count() = newSuspendedTransaction {
        Events
            .select { preselect(startTime, endTime) }
            .count()
    }

    suspend fun previousCount() = if (comparisonStartTime != null) {
        newSuspendedTransaction {
            Events.select { preselect(comparisonStartTime, startTime) }
                .count()
        }
    } else {
        null
    }

    private suspend fun topBy(n: Int?, primaryColumn: Column<*>, vararg otherColumns: Column<*>) =
        newSuspendedTransaction {
            val count = Events.userId.countDistinct().castTo<Long?>(LongColumnType())
            Events.slice(primaryColumn, *otherColumns, count)
                .select { preselect(startTime, endTime) }
                .groupBy(primaryColumn, *otherColumns)
                .having { count.greaterEq(1L) }
                .orderBy(count, SortOrder.DESC)
                .limit(n ?: 100)
                .map {
                    EventQuery.Count(
                        it[primaryColumn]?.toString(),
                        it[count] ?: 0,
                        if (otherColumns.isNotEmpty()) {
                            otherColumns.map { col -> col.name to it[col].toString() }.toMap()
                        } else {
                            null
                        }
                    )
                }
        }

    suspend fun topPages(n: Int?) = topBy(n, Events.path)

    suspend fun topSources(n: Int?) = newSuspendedTransaction {
        val count = Events.userId.countDistinct().castTo<Long?>(LongColumnType())
        Events.slice(Events.referrerClean, Events.sourceClean, count)
            .select {
                preselect(startTime, endTime) and
                        // We have some cases of refferer being null and source being not null.
                        // Looks like the Google bot
                        // Should probably be fixed with a migration
                        not(Events.referrerClean.isNull() and Events.sourceClean.isNotNull())
            }
            .groupBy(Events.referrerClean, Events.sourceClean)
            .having { count.greaterEq(1L) }
            .orderBy(count, SortOrder.DESC)
            .limit(n ?: 10)
            .map { EventQuery.Source(it[Events.referrerClean], it[Events.sourceClean], it[count] ?: 0) }
    }

    suspend fun topScreenSizes(n: Int?) = topBy(n, Events.device)

    suspend fun topCountries(n: Int?) = topBy(n, Events.country, Events.isoCountryCode)

    suspend fun topDevices(n: Int?) = topBy(n, Events.deviceName)

    suspend fun topDeviceClasses(n: Int?) = topBy(n, Events.deviceClass)

    suspend fun topOperatingSystems(n: Int?) = topBy(n, Events.operationGystemName)

    suspend fun topAgents(n: Int?) = topBy(n, Events.agentName)

    suspend fun countUnique() = newSuspendedTransaction {
        Events
            .slice(Events.userId)
            .select { preselect(startTime, endTime) }
            .withDistinct()
            .count()
    }

    suspend fun previousCountUnique() = if (comparisonStartTime != null) {
        newSuspendedTransaction {
            Events
                .slice(Events.userId)
                .select { preselect(comparisonStartTime, startTime) }
                .withDistinct()
                .count()
        }
    } else {
        null
    }

    suspend fun bounceCount() = newSuspendedTransaction {
        Events
            .slice(Events.userId, Events.userId.count())
            .select { preselect(startTime, endTime) }
            .groupBy(Events.userId)
            .having { Events.userId.count().eq(1) }
            .count()
    }

    suspend fun goals() = newSuspendedTransaction {
        val count = Events.userId.countDistinct().castTo<Long?>(LongColumnType()).alias("count")

        val eventTypePathCount = Events
            .slice(Events.type, Events.path, count)
            .select { Events.domain eq domain }
            .groupBy(Events.type, Events.path)
            .alias("event_type_path_by_count")

        val sum = eventTypePathCount[count].castTo<Long>(LongColumnType()).sum()

        Goals
            .join(Domains, JoinType.INNER, Goals.domain, Domains.id)
            .join(eventTypePathCount, JoinType.INNER, null, null) {
                eventTypePathCount[Events.type].eq(Goals.eventType) and (
                        eventTypePathCount[Events.path].eq(Goals.path) or Goals.path.eq("") or Goals.path.isNull()
                        )
            }
            .slice(Goals.id, Goals.name, sum)
            .select { Domains.domain eq domain }
            .groupBy(Goals.id)
            .orderBy(sum, SortOrder.DESC)
            .map {
                EventQuery.Count(it[Goals.name], it[sum] ?: 0, null)
            }
    }

    suspend fun previousBounceCount() = if (comparisonStartTime != null) {
        newSuspendedTransaction {
            Events
                .slice(Events.userId, Events.userId.count())
                .select { preselect(comparisonStartTime, startTime) }
                .groupBy(Events.userId)
                .having { Events.userId.count().eq(1) }
                .count()
        }
    } else {
        null
    }
}