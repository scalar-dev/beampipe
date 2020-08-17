package databasemigrations

import nl.basjes.parse.useragent.UserAgent
import nl.basjes.parse.useragent.UserAgentAnalyzer
import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

class V6__Extract_user_agent : BaseJavaMigration() {
    override fun migrate(context: Context?) {
        val uaa =  UserAgentAnalyzer
                .newBuilder()
                .hideMatcherLoadStats()
                .withCache(10000)
                .build();
        context!!.connection.createStatement().use { select ->
            select.executeQuery("SELECT id, user_agent FROM event").use { rows ->
                while (rows.next()) {
                    val id = rows.getObject(1)
                    val userAgent = uaa.parse(rows.getString(2))

                    context.connection.prepareStatement("""
                        UPDATE event
                        SET 
                        device_name = ?,
                        device_class = ?, 
                        operating_system_name = ?,
                        agent_name = ?
                        WHERE id = ?
                    """.trimIndent()).use { update ->
                        update.setString(1, userAgent.getValue(UserAgent.DEVICE_NAME))
                        update.setString(2, userAgent.getValue(UserAgent.DEVICE_CLASS))
                        update.setString(3, userAgent.getValue(UserAgent.OPERATING_SYSTEM_NAME))
                        update.setString(4, userAgent.getValue(UserAgent.AGENT_NAME))
                        update.setObject(5, id)
                        update.execute()
                    }
                }
            }
        }
    }
}
