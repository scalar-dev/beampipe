package dev.alexsparrow.alysis.server.graphql

import dev.alexsparrow.alysis.server.db.Domains
import org.jetbrains.exposed.sql.insertAndGetId
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.util.UUID
import javax.inject.Inject

class AccountApi {
    @Inject
    lateinit var userApi: UserApi

    suspend fun createDomain(context: Context, domain: String, public: Boolean): UUID {
        if (context.authentication == null) {
            throw Exception("Not allowed")
        } else {
            val user = userApi.user(context)!!

            return newSuspendedTransaction {
                Domains.insertAndGetId {
                    it[accountId] = user.id
                    it[Domains.domain] = domain
                    it[Domains.public] = public
                }
            }.value
        }
    }
}