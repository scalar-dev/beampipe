package io.beampipe.server.graphql

import io.beampipe.server.db.Accounts
import io.beampipe.server.db.Domains
import io.beampipe.server.db.Events
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.exists
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import java.security.MessageDigest
import java.util.UUID
import javax.inject.Singleton

@Singleton
class UserApi {
    data class User(val id: UUID, val email: String?, val name: String?)
    data class UserSettings(val email: String?, val subscription: String)
    data class Domain(val id: UUID, val domain: String, val hasData: Boolean, val public: Boolean)

    fun user(context: Context) = if (context.authentication != null) {
        User(
                UUID.fromString(context.authentication.attributes["accountId"] as String),
                context.authentication.attributes["email"] as String?,
                context.authentication.attributes["name"] as String?
        )
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

    suspend fun domains(context: Context): List<Domain> = newSuspendedTransaction {
        val user = user(context)

        if (user != null) {
            val hasData = exists(Events.select { Events.domain.eq(Domains.domain)}).alias("hasData")

            Domains.join(Accounts, JoinType.INNER, Domains.accountId, Accounts.id)
                    .slice(Domains.id, Domains.domain, Domains.public, hasData)
                    .select {
                        Accounts.id.eq(user.id)
                    }
                    .orderBy(Domains.domain)
                    .map { Domain(it[Domains.id].value, it[Domains.domain], it[hasData], it[Domains.public]) }
        } else {
            emptyList()
        }
    }
}