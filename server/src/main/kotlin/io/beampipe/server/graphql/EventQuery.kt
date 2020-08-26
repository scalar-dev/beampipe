package io.beampipe.server.graphql

import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.db.Goals
import io.beampipe.server.db.util.AtTimeZone
import io.beampipe.server.db.util.TimeBucketGapFillStartEnd
import io.beampipe.server.graphql.util.Context
import io.beampipe.server.graphql.util.CustomException
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ExpressionAlias
import org.jetbrains.exposed.sql.FieldSet
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.LongColumnType
import org.jetbrains.exposed.sql.QueryAlias
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.less
import org.jetbrains.exposed.sql.`java-time`.timestampLiteral
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.castTo
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.countDistinct
import org.jetbrains.exposed.sql.not
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.sum
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton


fun timePeriodToStartTime(origin: Instant, timePeriodStart: String?): Instant = when (timePeriodStart ?: "day") {
    "day" -> origin.minus(1, ChronoUnit.DAYS)
    "hour" -> origin.minus(1, ChronoUnit.HOURS)
    "week" -> origin.minus(7, ChronoUnit.DAYS)
    "month" -> origin.minus(28, ChronoUnit.DAYS)
    else -> throw Exception("Invalid time period")
}

@Singleton
class EventQuery {
    @Inject
    lateinit var accountQuery: AccountQuery

    data class Bucket(val time: ZonedDateTime, val count: Long)
    data class Count(val key: String?, val count: Long)
    data class Source(val referrer: String?, val source: String?, val count: Long)

    data class Event(
        val type: String,
        val time: Instant,
        val source: String?,
        val city: String?,
        val country: String?
    )

    data class TimePeriod(
        val type: String,
        val startTime: Instant?,
        val endTime: Instant?
    ) {
        fun toStartTime(): Instant = when (type) {
            "custom" -> startTime!!
            else -> timePeriodToStartTime(Instant.now(), type)
        }

        fun toEndTime(): Instant = when (type) {
            "custom" -> endTime!!
            else -> Instant.now()
        }

        fun toPreviousStartTime() = when (type) {
            "custom" -> null
            else -> timePeriodToStartTime(toStartTime(), type)
        }
    }

    private fun matchingDomain(userId: UUID?, domain: String) =
        Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
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
            ?: throw CustomException("Domain not found")

    data class EventsQuery(
        private val domain: String,
        private val startTime: Instant,
        private val endTime: Instant,
        private val comparisonStartTime: Instant?,
        private val timeZone: ZoneId
    ) {
        private fun preselect(periodStartTime: Instant, periodEndTime: Instant) = Events.domain.eq(domain) and
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
                    Bucket(it[timeBucket].atZone(timeZone).withZoneSameInstant(ZoneOffset.UTC), it[count] ?: 0)
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
                    Bucket(it[timeBucket].atZone(timeZone).withZoneSameInstant(ZoneOffset.UTC), it[count] ?: 0)
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

        private suspend fun topBy(column: Column<*>, n: Int?) = newSuspendedTransaction {
            val count = Events.userId.countDistinct().castTo<Long?>(LongColumnType())
            Events.slice(column, count)
                .select { preselect(startTime, endTime) }
                .groupBy(column)
                .having { count.greaterEq(1L) }
                .orderBy(count, SortOrder.DESC)
                .limit(n ?: 10)
                .map { Count(it[column]?.toString(), it[count] ?: 0) }
        }

        suspend fun topPages(n: Int?) = topBy(Events.path, n)

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
                .map { Source(it[Events.referrerClean], it[Events.sourceClean], it[count] ?: 0) }
        }

        suspend fun topScreenSizes(n: Int?) = topBy(Events.device, n)

        suspend fun topCountries(n: Int?) = topBy(Events.country, n)

        suspend fun topDevices(n: Int?) = topBy(Events.deviceName, n)

        suspend fun topDeviceClasses(n: Int?) = topBy(Events.deviceClass, n)

        suspend fun topOperatingSystems(n: Int?) = topBy(Events.operationGystemName, n)

        suspend fun topAgents(n: Int?) = topBy(Events.agentName, n)

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

        private fun QueryAlias.sliceAliasedQuery(): FieldSet {
            return slice(columns + query
                .set
                .fields
                .filterNot { it in query.set.source.columns }
                .filterIsInstance<ExpressionAlias<Any>>()
                .map { this[it] }
            )
        }

        suspend fun goals() = newSuspendedTransaction {
            val count = Events.userId.countDistinct().castTo<Long?>(LongColumnType()).alias("count")

            val eventTypePathCount = Events
                .slice(Events.type, Events.path, count)
                .selectAll()
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
                .selectAll()
                .groupBy(Goals.id)
                .map {
                    Count(it[Goals.name], it[sum] ?: 0)
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

    suspend fun liveUnique(context: Context, domain: String) = newSuspendedTransaction {
        val userId = accountQuery.user(context)?.id
        matchingDomain(userId, domain)

        Events
            .slice(Events.userId)
            .select {
                Events.domain.eq(domain) and
                        Events.time.greaterEq(Instant.now().minus(5, ChronoUnit.MINUTES))
            }
            .withDistinct()
            .count()
    }

    suspend fun events(context: Context, domain: String, timePeriod: TimePeriod, timeZone: String?): EventsQuery =
        newSuspendedTransaction {
            val userId = accountQuery.user(context)?.id
            val domainRow = matchingDomain(userId, domain)

            val zoneId = when {
                timeZone != null -> ZoneId.of(timeZone)
                userId != null -> ZoneId.of(domainRow[Accounts.timeZone])
                else -> ZoneOffset.UTC
            }

            EventsQuery(
                domain,
                timePeriod.toStartTime(),
                timePeriod.toEndTime(),
                timePeriod.toPreviousStartTime(),
                zoneId
            )
        }
}