package io.beampipe.server.graphql

import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.graphql.util.Context
import io.beampipe.server.graphql.util.CustomException
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.select
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
    data class Count(val key: String?, val count: Long, val label: String?)
    data class GoalCount(val id: UUID, val name: String, val description: String?, val eventType: String, val path: String?, val count: Long)
    data class Source(val referrer: String?, val source: String?, val count: Long)

    data class Drilldowns(
        val referrer: Drilldown.Referrer?,
        val page: Drilldown.Page?,
        val country: Drilldown.Country?,
        val time: Drilldown.Time?,
        val device: Drilldown.Device?,
        val deviceName: Drilldown.DeviceName?,
        val deviceClass: Drilldown.DeviceClass?,
        val operatingSystem: Drilldown.OperatingSystem?,
        val userAgent: Drilldown.UserAgent?
    ) {
        fun list(): List<Drilldown> = listOfNotNull(
            referrer,
            page,
            country,
            time,
            device,
            deviceName,
            deviceClass,
            operatingSystem,
            userAgent
        )
    }

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

    suspend fun events(
        context: Context,
        domain: String,
        timePeriod: TimePeriod,
        timeZone: String?,
        drilldowns: Drilldowns?
    ) : EventStats =
        newSuspendedTransaction {
            val userId = accountQuery.user(context)?.id
            val domainRow = matchingDomain(userId, domain)

            val zoneId = when {
                timeZone != null -> ZoneId.of(timeZone)
                userId != null -> ZoneId.of(domainRow[Accounts.timeZone])
                else -> ZoneOffset.UTC
            }

            val isEditable = Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                .select {
                    Domains.domain.eq(domain) and Accounts.id.eq(userId)
                }
                .firstOrNull() != null

            EventStats(
                domain,
                timePeriod.toStartTime(),
                timePeriod.toEndTime(),
                timePeriod.toPreviousStartTime(),
                zoneId,
                drilldowns?.list() ?: emptyList(),
                isEditable
            )
        }
}

