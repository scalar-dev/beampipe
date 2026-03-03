package server

import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Goals
import io.beampipe.server.graphql.AccountMutations
import io.beampipe.server.graphql.AccountQuery
import io.beampipe.server.graphql.DomainMutations
import io.beampipe.server.graphql.DomainQuery
import io.beampipe.server.graphql.util.CustomException
import io.micronaut.test.extensions.junit5.annotation.MicronautTest
import io.micronaut.test.support.TestPropertyProvider
import kotlinx.coroutines.runBlocking
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Order
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.TestMethodOrder
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID
import jakarta.inject.Inject

@Testcontainers
@MicronautTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class GraphQLAuthenticatedShould : TestPropertyProvider {
    companion object {
        @Container
        @JvmStatic
        private val postgresContainer = KPostgreSQLContainer()
    }

    @Inject lateinit var accountQuery: AccountQuery
    @Inject lateinit var accountMutations: AccountMutations
    @Inject lateinit var domainQuery: DomainQuery
    @Inject lateinit var domainMutations: DomainMutations

    private lateinit var accountId: UUID
    private lateinit var domainId1: UUID
    private lateinit var domainId2: UUID

    @BeforeAll
    fun setup() {
        accountId = TestHelper.createAccount(email = "auth@test.com", name = "Auth User")
        domainId1 = TestHelper.createDomain(accountId, "auth-test1.com", public = true)
        domainId2 = TestHelper.createDomain(accountId, "auth-test2.com", public = false)

        // Insert events for domain1 only
        val now = Instant.now()
        (1..3).forEach { i ->
            TestHelper.insertEvent(
                domain = "auth-test1.com",
                path = "/page-$i",
                userId = i.toLong(),
                time = now.minus(i.toLong(), ChronoUnit.HOURS)
            )
        }
    }

    @Test
    @Order(1)
    fun return_account_settings() = runBlocking {
        val context = TestHelper.testContext(accountId)
        val settings = accountQuery.settings(context)

        assertNotNull(settings)
        assertEquals("auth@test.com", settings!!.email)
        assertEquals(accountId, settings.accountId)
        assertEquals("basic", settings.subscription)
        assertEquals(2L, settings.domains.current)
        assertEquals(5L, settings.domains.max)
        assertEquals(3L, settings.pageViews.current)
    }

    @Test
    @Order(2)
    fun return_domains_with_hasData_flag() = runBlocking {
        val context = TestHelper.testContext(accountId)
        val domains = accountQuery.domains(context)

        assertEquals(2, domains.size)

        val domain1 = domains.find { it.domain == "auth-test1.com" }
        val domain2 = domains.find { it.domain == "auth-test2.com" }

        assertNotNull(domain1)
        assertNotNull(domain2)
        assertTrue(domain1!!.hasData)
        assertFalse(domain2!!.hasData)
        assertTrue(domain1.public)
        assertFalse(domain2.public)
    }

    @Test
    fun create_and_update_domain() = runBlocking {
        val context = TestHelper.testContext(accountId)

        // Create
        val newDomainId = domainMutations.createOrUpdateDomain(context, null, "new-domain.com", true)
        assertNotNull(newDomainId)

        // Update
        val updatedId = domainMutations.createOrUpdateDomain(context, newDomainId, "updated-domain.com", false)
        assertEquals(newDomainId, updatedId)

        // Verify the update
        val domains = accountQuery.domains(context)
        val updated = domains.find { it.id == newDomainId }
        assertNotNull(updated)
        assertEquals("updated-domain.com", updated!!.domain)
        assertFalse(updated.public)
    }

    @Test
    fun add_and_delete_goal() = runBlocking {
        val context = TestHelper.testContext(accountId)

        // Add goal
        val goalId = domainMutations.addGoal(
            context,
            domainId1,
            "Test Goal",
            "A test goal",
            "page_view",
            "/signup"
        )
        assertNotNull(goalId)

        // List goals
        val goals = domainQuery.listGoals(context, domainId1)
        assertTrue(goals.any { it.id == goalId })
        val goal = goals.find { it.id == goalId }!!
        assertEquals("Test Goal", goal.name)
        assertEquals("A test goal", goal.description)
        assertEquals("page_view", goal.eventType)

        // Delete goal
        domainMutations.deleteGoal(context, goalId)

        // Verify deletion
        val goalsAfter = domainQuery.listGoals(context, domainId1)
        assertFalse(goalsAfter.any { it.id == goalId })
    }

    @Test
    fun look_up_domain_by_id() = runBlocking {
        val context = TestHelper.testContext(accountId)
        val domain = domainQuery.domain(context, domainId1, "auth-test1.com")

        assertEquals(domainId1, domain.domainId)
    }

    @Test
    fun create_user() = runBlocking {
        val newId = accountMutations.createUser("newuser@test.com", "password123", true)
        assertNotNull(newId)

        // Verify in DB
        val account = transaction {
            Accounts.selectAll().where { Accounts.id eq newId }.firstOrNull()
        }
        assertNotNull(account)
        assertEquals("newuser@test.com", account!![Accounts.email])
    }

    @Test
    fun reject_duplicate_email() = runBlocking {
        // Create first user
        accountMutations.createUser("duplicate@test.com", "password123", true)

        // Try duplicate
        val exception = assertThrows(CustomException::class.java) {
            runBlocking {
                accountMutations.createUser("duplicate@test.com", "password456", true)
            }
        }
        assertEquals("Account already registered with this email address", exception.message)
    }

    @Test
    fun reject_short_password() {
        val exception = assertThrows(CustomException::class.java) {
            runBlocking {
                accountMutations.createUser("shortpw@test.com", "short", true)
            }
        }
        assertEquals("Invalid password", exception.message)
    }

    @Test
    fun reject_invalid_email() {
        val exception = assertThrows(CustomException::class.java) {
            runBlocking {
                accountMutations.createUser("not-an-email", "password123", true)
            }
        }
        assertEquals("Email address is invalid", exception.message)
    }

    @Test
    @Order(20)
    fun update_name() = runBlocking {
        val context = TestHelper.testContext(accountId)
        val result = accountMutations.updateName(context, "New Name")
        assertEquals("New Name", result)

        val account = transaction {
            Accounts.selectAll().where { Accounts.id eq accountId }.first()
        }
        assertEquals("New Name", account[Accounts.name])
    }

    @Test
    @Order(21)
    fun update_email() = runBlocking {
        val context = TestHelper.testContext(accountId)
        val result = accountMutations.updateEmail(context, "updated@test.com")
        assertEquals("updated@test.com", result)
    }

    @Test
    fun reject_invalid_email_on_update() {
        val context = TestHelper.testContext(accountId)
        val exception = assertThrows(CustomException::class.java) {
            runBlocking {
                accountMutations.updateEmail(context, "not-valid")
            }
        }
        assertEquals("Invalid email address", exception.message)
    }

    @Test
    @Order(22)
    fun update_timezone() = runBlocking {
        val context = TestHelper.testContext(accountId)
        val result = accountMutations.updateTimeZone(context, "America/New_York")
        assertEquals("America/New_York", result)

        val account = transaction {
            Accounts.selectAll().where { Accounts.id eq accountId }.first()
        }
        assertEquals("America/New_York", account[Accounts.timeZone])
    }

    @Test
    fun reject_invalid_timezone() {
        val context = TestHelper.testContext(accountId)
        val exception = assertThrows(CustomException::class.java) {
            runBlocking {
                accountMutations.updateTimeZone(context, "Invalid/Zone")
            }
        }
        assertEquals("Invalid timezone", exception.message)
    }

    @Test
    fun deny_access_to_other_accounts_domain() = runBlocking {
        val otherAccountId = TestHelper.createAccount(email = "other@test.com")
        val otherDomainId = TestHelper.createDomain(otherAccountId, "other.com")

        val context = TestHelper.testContext(accountId)

        val exception = assertThrows(Exception::class.java) {
            runBlocking {
                domainQuery.listGoals(context, otherDomainId)
            }
        }
        assertEquals("Domain not found", exception.message)
    }

    override fun getProperties(): MutableMap<String, String> {
        return mutableMapOf(
            "postgres.port" to postgresContainer.firstMappedPort.toString(),
            "postgres.host" to postgresContainer.host
        )
    }
}
