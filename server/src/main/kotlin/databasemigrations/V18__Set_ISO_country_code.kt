package databasemigrations

import com.neovisionaries.i18n.CountryCode
import org.apache.logging.log4j.LogManager
import org.flywaydb.core.api.migration.BaseJavaMigration
import org.flywaydb.core.api.migration.Context

class V18__Set_ISO_country_code : BaseJavaMigration() {
    val LOG = LogManager.getLogger()

    override fun migrate(context: Context?) {
        val countryNameToCode: Map<String, String> = CountryCode.values()
            .map { it.getName() to it.alpha2}
            .toMap<String, String>() + mapOf<String, String>(
            "Vietnam" to CountryCode.VN.alpha2,
            "Russia" to CountryCode.RU.alpha2,
            "Czechia" to CountryCode.CZ.alpha2,
            "Republic of Lithuania" to CountryCode.LT.alpha2
        )
        context!!.connection.createStatement().use { select ->
            select.executeQuery("SELECT id, country FROM event").use { rows ->
                while (rows.next()) {
                    val id = rows.getObject(1)
                    val country = rows.getString(2)

                    context.connection.prepareStatement(
                        """
                        UPDATE event
                        SET 
                        iso_country_code = ?
                        WHERE id = ?
                    """.trimIndent()
                    ).use { update ->
                        if (country != null && country !in countryNameToCode) {
                            LOG.warn("Country code could not be deduced: {}. Fix manually.", country)
                        }
                        update.setString(1, countryNameToCode[country])
                        update.setObject(2, id)
                        update.execute()
                    }
                }
            }
        }
    }
}
