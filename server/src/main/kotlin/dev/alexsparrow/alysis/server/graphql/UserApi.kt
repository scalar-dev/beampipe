package dev.alexsparrow.alysis.server.graphql

import dev.alexsparrow.alysis.server.db.Accounts
import dev.alexsparrow.alysis.server.db.Domains
import io.micronaut.security.utils.SecurityService
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.stringLiteral
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import javax.inject.Inject

class UserApi {
    @Inject
    lateinit var securityService: SecurityService

    data class User(val name: String, val id: UUID)
    data class Domain(val domain: String)

    fun user(): User? = securityService.authentication.map { User(it.name, UUID.fromString(it.attributes["accountId"] as String)) } .orElse(null)

    fun domains() = transaction {
        val user = user()

        if (user != null) {
            Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                    .select {
                        Accounts.id.eq(user.id)
                    }
                    .map { it[Domains.domain] }
        }
    }
}