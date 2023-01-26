package server

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.beampipe.server.api.EventEndpoint
import io.beampipe.server.auth.hashPassword
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.graphql.EventQuery
import io.micronaut.configuration.graphql.GraphQLRequestBody
import io.micronaut.http.HttpRequest
import io.micronaut.http.MediaType
import io.micronaut.http.client.RxHttpClient
import io.micronaut.http.client.annotation.Client
import io.micronaut.test.extensions.junit5.annotation.MicronautTest
import io.micronaut.test.support.TestPropertyProvider
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.Before
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.TestMethodOrder
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import javax.inject.Inject

@Testcontainers
@MicronautTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class EventEndpointShould : TestPropertyProvider {
    companion object {
        @Container
        @JvmStatic
        private val postgresContainer = KPostgreSQLContainer()
    }

    @Inject
    @field:Client("/")
    lateinit var client: RxHttpClient

    private fun event() = EventEndpoint.Event(
        "event",
        "http://www.hello.com",
        "foo.com",
        "foo",
        "foo",
        "Firefox",
        1024
    )

//    data class Response<T>(val data: T)
//    data class Events(val rawEvents: List<EventQuery.Event>)

    @BeforeAll
    fun setup() {
        transaction {
            val accountId = Accounts.insertAndGetId {
                it[Accounts.email] = "person@hello.com"
                it[Accounts.password] = "whatever"
                it[Accounts.salt] = "foo"
                it[Accounts.emailOk] = true
            }.value

            Domains.insertAndGetId {
                it[Domains.domain] = "hello.com"
                it[Domains.accountId] = accountId
                it[Domains.public] = true
            }.value
        }
    }

    @Test
    fun insert_events() {
        (0..2).forEach {
            val request = HttpRequest.POST("/event", event()).header("X-Forwarded-For", "4.4.4.4")
            client.toBlocking()
                .exchange<EventEndpoint.Event, Void>(request)
        }

        val events = transaction {
            Events.selectAll().toList()
        }

        assertEquals(3, events.size)

        events.forEach { event ->
            assertEquals("foo.com", event[Events.domain])
            assertEquals("event", event[Events.type])
        }
    }

    override fun getProperties(): MutableMap<String, String> {
        return mutableMapOf("postgres.port" to postgresContainer.firstMappedPort.toString())
    }
}
