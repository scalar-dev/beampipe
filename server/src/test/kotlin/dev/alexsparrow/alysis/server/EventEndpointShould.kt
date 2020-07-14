package server

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import dev.alexsparrow.alysis.server.api.EventEndpoint
import dev.alexsparrow.alysis.server.graphql.EventsApi
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
import kotlin.time.ExperimentalTime
import kotlin.time.measureTime

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
            "foo",
            "foo",
            "Firefox",
            1024
    )

    data class Response<T>(val data: T)
    data class Events(val bucketEvents: List<EventsApi.Bucket>)

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
              bucketEvents(domain: "hello.com") {
                time,
                count
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

        val total = events.data.bucketEvents.fold<EventsApi.Bucket, Long>(0, { acc, bucket -> acc + bucket.count })

        assertEquals(3, total)
    }

    override fun getProperties(): MutableMap<String, String> {
        return mutableMapOf("postgres.port" to postgresContainer.firstMappedPort.toString())
    }
}
