package dev.alexsparrow.alysis.server.graphql

import dev.alexsparrow.alysis.server.db.Accounts
import dev.alexsparrow.alysis.server.db.Domains
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import javax.inject.Singleton

@Singleton
class UserApi {
    data class User(val email: String?, val id: UUID)
    data class UserSettings(val email: String?, val subscription: String)
    data class Domain(val domain: String)

    fun user(context: Context) = if (context.authentication != null) {
        User(context.authentication.attributes["email"] as String?,
                UUID.fromString(context.authentication.attributes["accountId"] as String))
    } else {
        null
    }

    fun settings(context: Context) = if (context.authentication != null) {
        transaction {
            Accounts.select { Accounts.id.eq(UUID.fromString(context.authentication.attributes["accountId"] as String)) }
                    .map { UserSettings(it[Accounts.email], it[Accounts.subscription]) }
                    .firstOrNull()
        }
    } else {
        null
    }

    suspend fun domains(context: Context): List<String> = newSuspendedTransaction {
        val user = user(context)

        if (user != null) {
            Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                    .select {
                        Accounts.id.eq(user.id)
                    }
                    .map { it[Domains.domain] }
        } else {
            emptyList()
        }
    }
}