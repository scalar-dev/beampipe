package server

import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import io.beampipe.server.db.Goals
import io.beampipe.server.graphql.util.Context
import io.micronaut.security.authentication.Authentication
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

object TestHelper {
    fun createAccount(
        email: String = "test@test.com",
        password: String = "hashed",
        salt: String = "salt",
        name: String? = "Test User"
    ): UUID = transaction {
        Accounts.insertAndGetId {
            it[Accounts.email] = email
            it[Accounts.password] = password
            it[Accounts.salt] = salt
            it[Accounts.name] = name
            it[Accounts.emailOk] = true
        }.value
    }

    fun createDomain(
        accountId: UUID,
        domainName: String,
        public: Boolean = true
    ): UUID = transaction {
        Domains.insertAndGetId {
            it[Domains.domain] = domainName
            it[Domains.accountId] = accountId
            it[Domains.public] = public
        }.value
    }

    fun createGoal(
        domainId: UUID,
        name: String,
        eventType: String,
        description: String? = null,
        path: String? = null
    ): UUID = transaction {
        Goals.insertAndGetId {
            it[Goals.domain] = domainId
            it[Goals.name] = name
            it[Goals.eventType] = eventType
            it[Goals.description] = description
            it[Goals.path] = path
        }.value
    }

    fun insertEvent(
        domain: String,
        type: String = "page_view",
        path: String = "/",
        userId: Long = 1L,
        time: Instant = Instant.now(),
        referrer: String = "",
        referrerClean: String? = null,
        sourceClean: String? = null,
        source: String? = null,
        country: String? = null,
        isoCountryCode: String? = null,
        city: String? = null,
        screenWidth: Int = 1920,
        device: String = "desktop",
        userAgent: String = "TestAgent",
        deviceName: String = "Desktop",
        deviceClass: String = "Desktop",
        operatingSystemName: String = "Linux",
        agentName: String = "TestBrowser"
    ): UUID = transaction {
        Events.insertAndGetId {
            it[Events.domain] = domain
            it[Events.type] = type
            it[Events.path] = path
            it[Events.userId] = userId
            it[Events.time] = time
            it[Events.referrer] = referrer
            it[Events.referrerClean] = referrerClean
            it[Events.sourceClean] = sourceClean
            it[Events.source_] = source
            it[Events.country] = country
            it[Events.isoCountryCode] = isoCountryCode
            it[Events.city] = city
            it[Events.screenWidth] = screenWidth
            it[Events.device] = device
            it[Events.userAgent] = userAgent
            it[Events.deviceName] = deviceName
            it[Events.deviceClass] = deviceClass
            it[Events.operationGystemName] = operatingSystemName
            it[Events.agentName] = agentName
            it[Events.data] = emptyMap<String, Any>()
        }.value
    }

    fun testContext(accountId: UUID): Context {
        val attrs = mapOf<String, Any>(
            "accountId" to accountId.toString(),
            "email" to "test@test.com",
            "name" to "Test User"
        )
        val auth = object : Authentication {
            override fun getName(): String = accountId.toString()
            override fun getAttributes(): MutableMap<String, Any> = attrs.toMutableMap()
        }
        return Context(auth, "http://localhost:8080")
    }
}
