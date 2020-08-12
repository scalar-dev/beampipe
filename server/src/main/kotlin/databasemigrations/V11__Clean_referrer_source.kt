package databasemigrations

import com.snowplowanalytics.refererparser.Parser
import io.beampipe.server.api.cleanReferrer
import io.beampipe.server.api.cleanSource
import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

class V11__Clean_referrer_source : BaseJavaMigration() {
    val referrerParser = Parser()

    override fun migrate(context: Context?) {
        context!!.connection.createStatement().use { select ->
            select.executeQuery("SELECT id, domain, source, referrer FROM event").use { rows ->
                while (rows.next()) {
                    val id = rows.getObject(1)
                    val domain = rows.getString(2)
                    val source = rows.getString(3)
                    val referrer = rows.getString(4)
                    val parsedReferrer = referrerParser.parse(referrer, domain)
                    val referrerClean = cleanReferrer(domain, referrer)
                    val sourceClean = cleanSource(source, referrerClean, parsedReferrer)

                    context.connection.prepareStatement("""
                        UPDATE event
                        SET 
                        referrer_clean = ?,
                        source_clean = ? 
                        WHERE id = ?
                    """.trimIndent()).use { update ->
                        update.setString(1, referrerClean)
                        update.setString(2, sourceClean)
                        update.setObject(3, id)
                        update.execute()
                    }
                }
            }
        }
    }
}
