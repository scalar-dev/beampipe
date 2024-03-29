package io.beampipe.server.graphql

import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.db.Goals
import io.beampipe.server.db.util.AtTimeZone
import io.beampipe.server.db.util.TimeBucketGapFillStartEnd
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.LongColumnType
import org.jetbrains.exposed.sql.Op
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

sealed class Drilldown {
    abstract fun SqlExpressionBuilder.select(): Op<Boolean>

    fun selectSql(sql: SqlExpressionBuilder) = sql.select()

    data class Referrer(val source: String?, val referrer: String?, val isDirect: Boolean?) : Drilldown() {
        override fun SqlExpressionBuilder.select() = if (isDirect == true) {
            Events.sourceClean.isNull()
        } else if (source != null) {
            Events.sourceClean eq source
        } else {
            Events.referrerClean eq referrer
        }
    }

    data class Country(val isoCode: String?) : Drilldown() {
        override fun SqlExpressionBuilder.select() = if (isoCode != null) {
            Events.isoCountryCode eq isoCode
        } else {
            Events.isoCountryCode.isNull()
        }
    }

    data class Page(val path: String) : Drilldown() {
        override fun SqlExpressionBuilder.select() = Events.path eq path
    }

    data class Time(val start: Instant, val end: Instant): Drilldown() {
        override fun SqlExpressionBuilder.select(): Op<Boolean> = (Events.time greaterEq start) and (Events.time less end)
    }

    data class Device(val device: String): Drilldown() {
        override fun SqlExpressionBuilder.select(): Op<Boolean> = Events.device eq device
    }

    data class DeviceName(val deviceName: String): Drilldown() {
        override fun SqlExpressionBuilder.select(): Op<Boolean> = Events.deviceName eq deviceName
    }

    data class DeviceClass(val deviceClass: String): Drilldown() {
        override fun SqlExpressionBuilder.select(): Op<Boolean> = Events.deviceClass eq deviceClass
    }

    data class OperatingSystem(val operatingSystem: String): Drilldown() {
        override fun SqlExpressionBuilder.select(): Op<Boolean> = Events.operationGystemName eq operatingSystem
    }

    data class UserAgent(val userAgent: String): Drilldown() {
        override fun SqlExpressionBuilder.select(): Op<Boolean> = Events.agentName eq userAgent
    }
}

data class EventStats(
    private val domain: String,
    private val startTime: Instant,
    private val endTime: Instant,
    private val comparisonStartTime: Instant?,
    private val timeZone: ZoneId,
    private val drilldowns: List<Drilldown>,
    private val isEditable: Boolean
) {
    private fun SqlExpressionBuilder.preselect(periodStartTime: Instant, periodEndTime: Instant) =
        Events.domain.eq(domain) and
                Events.time.greaterEq(periodStartTime) and
                Events.time.less(periodEndTime) and
                drilldowns.map { drilldown ->
                    drilldown.selectSql(this)
                }.fold<Op<Boolean>,Op<Boolean>>(Op.TRUE) { a, b -> a and b }

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

    private suspend fun topBy(n: Int?, key: Column<*>, display:Column<*>? = null) =
        newSuspendedTransaction {
            val count = Events.userId.countDistinct().castTo<Long?>(LongColumnType())
            val columns = listOfNotNull(key, display).toTypedArray()

            Events.slice(count, *columns)
                .select { preselect(startTime, endTime) }
                .groupBy(*columns)
                .having { count.greaterEq(1L) }
                .orderBy(count, SortOrder.DESC)
                .limit(n ?: 100)
                .map {
                    EventQuery.Count(
                        it[columns[0]]?.toString(),
                        it[count] ?: 0,
                        if (display != null) {
                            it[display].toString()
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

    suspend fun topCountries(n: Int?) = topBy(n, Events.isoCountryCode, Events.country)

    suspend fun topDevices(n: Int?) = topBy(n, Events.deviceName)

    suspend fun topDeviceClasses(n: Int?) = topBy(n, Events.deviceClass)

    suspend fun topOperatingSystems(n: Int?) = topBy(n, Events.operationGystemName)

    suspend fun topAgents(n: Int?) = topBy(n, Events.agentName)

    suspend fun isEditable() = isEditable

    suspend fun startTime() = startTime

    suspend fun endTime() = endTime

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
            .join(eventTypePathCount, JoinType.LEFT, null, null) {
                eventTypePathCount[Events.type].eq(Goals.eventType) and (
                        eventTypePathCount[Events.path].eq(Goals.path) or Goals.path.eq("") or Goals.path.isNull()
                        )
            }
            .slice(Goals.id, Goals.name, Goals.description, Goals.eventType, Goals.path, sum)
            .select { Domains.domain eq domain }
            .groupBy(Goals.id)
            .orderBy(sum, SortOrder.DESC)
            .map {
                EventQuery.GoalCount(
                    it[Goals.id].value,
                    it[Goals.name],
                    it[Goals.description],
                    it[Goals.eventType],
                    it[Goals.path],
                    it[sum] ?: 0
                )
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