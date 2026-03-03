package server

import io.beampipe.server.db.Domains
import io.beampipe.server.db.Goals
import io.micronaut.http.HttpRequest
import io.micronaut.http.MediaType
import io.micronaut.http.client.HttpClient
import io.micronaut.http.client.annotation.Client
import io.micronaut.test.extensions.junit5.annotation.MicronautTest
import io.micronaut.test.support.TestPropertyProvider
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.Instant
import java.time.temporal.ChronoUnit
import jakarta.inject.Inject

@Testcontainers
@MicronautTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class GraphQLShould : TestPropertyProvider {
    companion object {
        @Container
        @JvmStatic
        private val postgresContainer = KPostgreSQLContainer()
    }

    @Inject
    @field:Client("/")
    lateinit var client: HttpClient

    @BeforeAll
    fun setup() {
        val accountId = TestHelper.createAccount(email = "graphql@test.com")
        TestHelper.createDomain(accountId, "public-test.com", public = true)

        val now = Instant.now()
        // Insert 5 events for public-test.com within the last 28 days
        (1..5).forEach { i ->
            TestHelper.insertEvent(
                domain = "public-test.com",
                path = "/page-$i",
                userId = i.toLong(),
                time = now.minus(i.toLong(), ChronoUnit.HOURS)
            )
        }

        // Insert 2 recent events (within 5 minutes) for liveUnique
        TestHelper.insertEvent(
            domain = "public-test.com",
            path = "/live",
            userId = 100L,
            time = now.minus(1, ChronoUnit.MINUTES)
        )
        TestHelper.insertEvent(
            domain = "public-test.com",
            path = "/live",
            userId = 101L,
            time = now.minus(2, ChronoUnit.MINUTES)
        )
    }

    private val mapper = jacksonObjectMapper()

    private fun graphqlQuery(query: String): String {
        val body = mapOf("query" to query)
        val request = HttpRequest.POST("/graphql", body)
            .contentType(MediaType.APPLICATION_JSON_TYPE)
        return client.toBlocking().retrieve(request)
    }

    private fun graphqlQueryJson(query: String): Map<String, Any> {
        return mapper.readValue(graphqlQuery(query))
    }

    @Suppress("UNCHECKED_CAST")
    @Test
    fun return_event_count_for_public_domain() {
        val json = graphqlQueryJson("""
            {
                events(domain: "public-test.com", timePeriod: {type: "month"}) {
                    count
                }
            }
        """.trimIndent())

        val data = json["data"] as Map<String, Any>
        val events = data["events"] as Map<String, Any>
        val count = (events["count"] as Number).toLong()
        // 5 regular events + 2 live events = at least 7
        assertTrue(count >= 7, "Expected count >= 7 but was $count")
    }

    @Suppress("UNCHECKED_CAST")
    @Test
    fun return_unique_count_for_public_domain() {
        val json = graphqlQueryJson("""
            {
                events(domain: "public-test.com", timePeriod: {type: "month"}) {
                    countUnique
                }
            }
        """.trimIndent())

        val data = json["data"] as Map<String, Any>
        val events = data["events"] as Map<String, Any>
        val countUnique = (events["countUnique"] as Number).toLong()
        // 7 distinct userIds: 1,2,3,4,5,100,101
        assertTrue(countUnique >= 7, "Expected countUnique >= 7 but was $countUnique")
    }

    @Suppress("UNCHECKED_CAST")
    @Test
    fun return_live_unique_count() {
        val json = graphqlQueryJson("""
            {
                liveUnique(domain: "public-test.com")
            }
        """.trimIndent())

        val data = json["data"] as Map<String, Any>
        val liveUnique = (data["liveUnique"] as Number).toLong()
        // 2 events within last 5 minutes with distinct userIds
        assertTrue(liveUnique >= 2, "Expected liveUnique >= 2 but was $liveUnique")
    }

    @Test
    fun return_top_pages_for_public_domain() {
        val response = graphqlQuery("""
            {
                events(domain: "public-test.com", timePeriod: {type: "month"}) {
                    topPages {
                        key
                        count
                    }
                }
            }
        """.trimIndent())

        assertTrue(response.contains("\"topPages\""))
        assertTrue(response.contains("/page-"))
    }

    @Test
    fun return_error_for_nonexistent_domain() {
        val response = graphqlQuery("""
            {
                events(domain: "nonexistent.com", timePeriod: {type: "month"}) {
                    count
                }
            }
        """.trimIndent())

        assertTrue(response.contains("errors") || response.contains("Domain not found"))
    }

    @Test
    fun return_bucketed_events() {
        val response = graphqlQuery("""
            {
                events(domain: "public-test.com", timePeriod: {type: "month"}) {
                    bucketed {
                        time
                        count
                    }
                }
            }
        """.trimIndent())

        assertTrue(response.contains("\"bucketed\""))
        assertTrue(response.contains("\"time\""))
        assertTrue(response.contains("\"count\""))
    }

    @Test
    fun return_bounce_count() {
        val response = graphqlQuery("""
            {
                events(domain: "public-test.com", timePeriod: {type: "month"}) {
                    bounceCount
                }
            }
        """.trimIndent())

        assertTrue(response.contains("\"bounceCount\""))
    }

    @Suppress("UNCHECKED_CAST")
    @Test
    fun return_empty_goals_list_when_no_goals_configured() {
        val json = graphqlQueryJson("""
            {
                events(domain: "public-test.com", timePeriod: {type: "month"}) {
                    goals {
                        id
                        name
                        count
                    }
                }
            }
        """.trimIndent())

        val data = json["data"] as Map<String, Any>
        val events = data["events"] as Map<String, Any>
        val goals = events["goals"] as List<*>
        assertNotNull(goals, "goals should not be null")
        assertTrue(goals.isEmpty(), "goals should be an empty list when none configured")
    }

    @Suppress("UNCHECKED_CAST")
    @Test
    fun return_goals_with_counts() {
        // Create a goal that matches page_view events
        val domainId = transaction {
            Domains.selectAll().where { Domains.domain eq "public-test.com" }
                .first()[Domains.id].value
        }
        val goalId = TestHelper.createGoal(
            domainId = domainId,
            name = "All page views",
            eventType = "page_view",
            path = ""
        )

        try {
            val json = graphqlQueryJson("""
                {
                    events(domain: "public-test.com", timePeriod: {type: "month"}) {
                        goals {
                            id
                            name
                            eventType
                            path
                            count
                        }
                    }
                }
            """.trimIndent())

            val data = json["data"] as Map<String, Any>
            val events = data["events"] as Map<String, Any>
            val goals = events["goals"] as List<Map<String, Any>>
            assertTrue(goals.isNotEmpty(), "goals should contain the created goal")
            val goal = goals.first()
            assertTrue(goal["name"] == "All page views")
            assertTrue(goal["eventType"] == "page_view")
            assertTrue((goal["count"] as Number).toLong() > 0, "goal count should be > 0")
        } finally {
            // Clean up the goal
            transaction {
                Goals.deleteWhere { Goals.id eq goalId }
            }
        }
    }

    override fun getProperties(): MutableMap<String, String> {
        return mutableMapOf(
            "postgres.port" to postgresContainer.firstMappedPort.toString(),
            "postgres.host" to postgresContainer.host
        )
    }
}
