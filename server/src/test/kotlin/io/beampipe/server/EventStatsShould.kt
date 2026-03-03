package server

import io.beampipe.server.graphql.EventStats
import io.micronaut.test.extensions.junit5.annotation.MicronautTest
import io.micronaut.test.support.TestPropertyProvider
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.Instant
import java.time.ZoneOffset
import java.time.temporal.ChronoUnit
import java.util.UUID

@Testcontainers
@MicronautTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class EventStatsShould : TestPropertyProvider {
    companion object {
        @Container
        @JvmStatic
        private val postgresContainer = KPostgreSQLContainer()
    }

    private lateinit var accountId: UUID
    private lateinit var domainId: UUID
    private val domainName = "stats-test.com"
    private val now = Instant.now()
    private val startTime = now.minus(28, ChronoUnit.DAYS)
    private val endTime = now.plus(1, ChronoUnit.HOURS)

    @BeforeAll
    fun setup() {
        accountId = TestHelper.createAccount(email = "stats@test.com")
        domainId = TestHelper.createDomain(accountId, domainName, public = true)

        // User 1: visits /home and /about (not a bounce)
        TestHelper.insertEvent(
            domain = domainName, path = "/home", userId = 1L,
            time = now.minus(1, ChronoUnit.HOURS),
            referrer = "https://google.com", referrerClean = "google.com", sourceClean = "Google",
            isoCountryCode = "US", country = "United States"
        )
        TestHelper.insertEvent(
            domain = domainName, path = "/about", userId = 1L,
            time = now.minus(50, ChronoUnit.MINUTES),
            referrer = "https://google.com", referrerClean = "google.com", sourceClean = "Google",
            isoCountryCode = "US", country = "United States"
        )

        // User 2: visits only /home (bounce)
        TestHelper.insertEvent(
            domain = domainName, path = "/home", userId = 2L,
            time = now.minus(2, ChronoUnit.HOURS),
            referrer = "https://twitter.com", referrerClean = "twitter.com", sourceClean = "Twitter",
            isoCountryCode = "GB", country = "United Kingdom"
        )

        // User 3: visits /pricing (bounce)
        TestHelper.insertEvent(
            domain = domainName, path = "/pricing", userId = 3L,
            time = now.minus(3, ChronoUnit.HOURS),
            referrer = "", referrerClean = null, sourceClean = null,
            isoCountryCode = "DE", country = "Germany"
        )

        // User 4: visits /home and /pricing (not a bounce)
        TestHelper.insertEvent(
            domain = domainName, path = "/home", userId = 4L,
            time = now.minus(4, ChronoUnit.HOURS),
            referrer = "https://google.com", referrerClean = "google.com", sourceClean = "Google",
            isoCountryCode = "US", country = "United States"
        )
        TestHelper.insertEvent(
            domain = domainName, path = "/pricing", userId = 4L,
            time = now.minus(3, ChronoUnit.HOURS).minus(30, ChronoUnit.MINUTES),
            referrer = "https://google.com", referrerClean = "google.com", sourceClean = "Google",
            isoCountryCode = "US", country = "United States"
        )

        // Create goals
        TestHelper.createGoal(domainId, "View Pricing", "page_view", path = "/pricing")
        TestHelper.createGoal(domainId, "Any Page View", "page_view", path = "")
    }

    private fun createStats(
        start: Instant = startTime,
        end: Instant = endTime,
        previousStart: Instant? = null
    ) = EventStats(
        domainName, start, end, previousStart, ZoneOffset.UTC, emptyList(), true
    )

    @Test
    fun count_total_events() = runBlocking {
        val stats = createStats()
        val count = stats.count()
        assertEquals(6L, count)
    }

    @Test
    fun count_unique_visitors() = runBlocking {
        val stats = createStats()
        val unique = stats.countUnique()
        assertEquals(4L, unique)
    }

    @Test
    fun return_top_pages_ranked() = runBlocking {
        val stats = createStats()
        val topPages = stats.topPages(10)

        assertTrue(topPages.isNotEmpty())
        // /home has 3 unique users (1,2,4), /pricing has 2 (3,4), /about has 1 (1)
        assertEquals("/home", topPages[0].key)
        assertEquals(3L, topPages[0].count)
        assertEquals("/pricing", topPages[1].key)
        assertEquals(2L, topPages[1].count)
        assertEquals("/about", topPages[2].key)
        assertEquals(1L, topPages[2].count)
    }

    @Test
    fun return_top_sources_ranked() = runBlocking {
        val stats = createStats()
        val topSources = stats.topSources(10)

        assertTrue(topSources.isNotEmpty())
        // Google: users 1,4 = 2 unique; Twitter: user 2 = 1 unique; Direct (null): user 3 = 1 unique
        val google = topSources.find { it.source == "Google" }
        assertNotNull(google)
        assertEquals(2L, google!!.count)
    }

    @Test
    fun return_top_countries_ranked() = runBlocking {
        val stats = createStats()
        val topCountries = stats.topCountries(10)

        assertTrue(topCountries.isNotEmpty())
        // US: users 1,4 = 2; GB: user 2 = 1; DE: user 3 = 1
        val us = topCountries.find { it.key == "US" }
        assertNotNull(us)
        assertEquals(2L, us!!.count)
    }

    @Test
    fun count_bounces() = runBlocking {
        val stats = createStats()
        val bounceCount = stats.bounceCount()
        // Users 2 and 3 have exactly 1 event each = bounces
        assertEquals(2L, bounceCount)
    }

    @Test
    fun return_empty_goals_list_when_no_goals_configured() = runBlocking {
        // Create a domain with no goals
        val emptyDomainId = TestHelper.createDomain(accountId, "no-goals.com", public = true)
        TestHelper.insertEvent(domain = "no-goals.com", path = "/", userId = 1L, time = now.minus(1, ChronoUnit.HOURS))

        val stats = EventStats("no-goals.com", startTime, endTime, null, ZoneOffset.UTC, emptyList(), true)
        val goals = stats.goals()

        assertNotNull(goals)
        assertTrue(goals.isEmpty(), "goals should be an empty list when none configured, but was: $goals")
    }

    @Test
    fun return_goals_with_counts() = runBlocking {
        val stats = createStats()
        val goals = stats.goals()

        assertTrue(goals.isNotEmpty())

        val pricingGoal = goals.find { it.name == "View Pricing" }
        assertNotNull(pricingGoal)
        // /pricing: users 3,4 = 2 unique
        assertEquals(2L, pricingGoal!!.count)
    }

    @Test
    fun return_bucketed_events() = runBlocking {
        val stats = createStats()
        val bucketed = stats.bucketed(null)

        // Should return day-level buckets covering the 28-day range
        assertTrue(bucketed.isNotEmpty())
        // Total count across all buckets should equal 6
        val totalCount = bucketed.sumOf { it.count }
        assertEquals(6L, totalCount)
    }

    @Test
    fun return_previous_count() = runBlocking {
        val previousStart = startTime.minus(28, ChronoUnit.DAYS)
        val stats = createStats(previousStart = previousStart)
        val prevCount = stats.previousCount()

        // No events in the previous period
        assertNotNull(prevCount)
        assertEquals(0L, prevCount)
    }

    @Test
    fun count_unique_with_hourly_buckets() = runBlocking {
        val stats = createStats()
        val bucketed = stats.bucketedUnique("hour")

        assertTrue(bucketed.isNotEmpty())
    }

    @Test
    fun report_editability() = runBlocking {
        val stats = createStats()
        assertTrue(stats.isEditable())
    }

    @Test
    fun report_time_range() = runBlocking {
        val stats = createStats()
        assertEquals(startTime, stats.startTime())
        assertEquals(endTime, stats.endTime())
    }

    private fun assertNotNull(value: Any?) {
        org.junit.jupiter.api.Assertions.assertNotNull(value)
    }

    override fun getProperties(): MutableMap<String, String> {
        return mutableMapOf(
            "postgres.port" to postgresContainer.firstMappedPort.toString(),
            "postgres.host" to postgresContainer.host
        )
    }
}
