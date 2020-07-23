package dev.alexsparrow.alysis.server.graphql

import dev.alexsparrow.alysis.server.db.Domains
import io.micronaut.security.utils.SecurityService
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.util.UUID
import javax.inject.Inject

class AccountApi {
    @Inject
    lateinit var securityService: SecurityService

    suspend fun createDomain(domain: String): String {
       println(securityService.authentication)

        newSuspendedTransaction {
            Domains.insert {
                it[accountId] = UUID.randomUUID()
                it[Domains.domain] = domain
                it[public] = false
            }
        }

        return "hello"
    }
}