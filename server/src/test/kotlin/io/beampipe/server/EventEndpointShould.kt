package server

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.beampipe.server.api.EventEndpoint
import io.beampipe.server.graphql.EventsApi
import io.micronaut.configuration.graphql.GraphQLRequestBody
import io.micronaut.http.HttpRequest
import io.micronaut.http.MediaType
import io.micronaut.http.client.RxHttpClient
import io.micronaut.http.client.annotation.Client
import io.micronaut.test.annotation.MicronautTest
import io.micronaut.test.support.TestPropertyProvider
import org.junit.jupiter.api.Assertions.assertEquals
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

    data class Response<T>(val data: T)
    data class Events(val events: List<EventsApi.Event>)

    @Test
    fun insert_events() {
        (0..2).forEach {
            val request = HttpRequest.POST("/event", event()).header("X-Forwarded-For", "4.4.4.4")
            client.toBlocking()
                    .exchange<EventEndpoint.Event, Void>(request)
        }

        val body = GraphQLRequestBody()
        body.query= """
            {
              events(domain: "hello.com") {
                type
                time
                source
                city
                country
              } 
            }
        """.trimIndent()

        val response = client.toBlocking().retrieve(
                HttpRequest.POST("/graphql", body)
                        .contentType(MediaType.APPLICATION_JSON)
        )
        val objectMapper = jacksonObjectMapper()
        objectMapper.registerModule(JavaTimeModule())
        val events = objectMapper.readValue<Response<Events>>(response)

        assertEquals("Nashville", events.data.events[0].city)
        assertEquals("United States", events.data.events[0].country)
    }

    override fun getProperties(): MutableMap<String, String> {
        return mutableMapOf("postgres.port" to postgresContainer.firstMappedPort.toString())
    }
}