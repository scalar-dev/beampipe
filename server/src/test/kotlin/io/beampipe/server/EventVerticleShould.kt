package io.beampipe.server

import io.beampipe.server.api.Event
import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.graphql.EventQuery
import io.vertx.core.DeploymentOptions
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.ext.web.client.WebClient
import io.vertx.junit5.VertxExtension
import io.vertx.kotlin.coroutines.await
import kotlinx.coroutines.runBlocking
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import server.KPostgreSQLContainer

@Testcontainers
@ExtendWith(VertxExtension::class)
class EventVerticleShould {
    @Container
    private val postgresContainer = KPostgreSQLContainer()

    private fun event() = Event(
        "event",
        "http://www.hello.com",
        "foo.com",
        "foo",
        "foo",
        "Firefox",
        1024
    )

    data class Response<T>(val data: T)
    data class Events(val events: List<EventQuery.Event>)

    @Test
    fun insert_events(vertx: Vertx) = runBlocking {
        vertx.deployVerticle(Application::class.java, DeploymentOptions().setConfig(JsonObject(mapOf(
            "JWT_KEY" to "what",
            "PGHOST" to postgresContainer.host,
            "PGPORT" to postgresContainer.firstMappedPort,
            "PGUSER" to postgresContainer.username,
            "PGPASSWORD" to postgresContainer.password
        )))).await()
        val client = WebClient.create(vertx)

        val domainId = newSuspendedTransaction {
            val accountId = Accounts.insertAndGetId {
                it[Accounts.email] = "test@foo.com"
            }

            Domains.insertAndGetId {
                it[Domains.accountId] = accountId.value
                it[Domains.domain] = "foo.com"
                it[Domains.public] = true
            }
        }

        repeat((0..2).count()) {
            val response = client.post(8081, "localhost", "/event")
                .putHeader("X-Forwarded-For", "4.4.4.4")
                .sendJson(event())
                .await()
            assertEquals(response.statusCode(), 200)
        }

        val body = JsonObject()
            .put("query", """
            {
              events(domain: "foo.com", timePeriod: { type: "day" }) {
                count 
              }
            }
        """.trimIndent())

        val response = client.post(8080, "localhost", "/graphql")
            .putHeader("Content-Type", "application/json")
            .sendJson(body)
            .await()

        val events = response.bodyAsJsonObject()
        assertEquals(3, events.getJsonObject("data").getJsonObject("events").getInteger("count"))
    }
}
