package io.beampipe.server.api

import com.maxmind.geoip2.DatabaseReader
import com.snowplowanalytics.refererparser.Parser
import io.beampipe.server.db.Events
import io.beampipe.server.slack.SlackNotifier
import io.beampipe.server.slack.logger
import io.whitfin.siphash.SipHasher
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import nl.basjes.parse.useragent.UserAgent
import nl.basjes.parse.useragent.UserAgentAnalyzer
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.io.File
import java.net.InetAddress
import java.net.URI
import java.time.Instant
import java.util.*

class EventEndpoint(private val geoLite2DbPath: String?, private val slackNotifier: SlackNotifier) {
    val LOG = logger()

//    @Inject
//    lateinit var clientAddressResolver: HttpClientAddressResolver

    val uaa = UserAgentAnalyzer
        .newBuilder()
        .hideMatcherLoadStats()
        .withCache(10000)
        .build()

    val referrerParser = Parser()

    var key: ByteArray = "0123456789ABCDEF".toByteArray()
    var container = SipHasher.container(key)

    private val database = if (geoLite2DbPath != null) File(geoLite2DbPath) else null
    private val reader = if (database != null) DatabaseReader.Builder(database).build() else null

    data class Event(
        val type: String,
        val url: String,
        val domain: String?,
        val referrer: String,
        val source: String?,
        val userAgent: String,
        val screenWidth: Int
    )

    fun screenWidthToDevice(width: Int): String = when {
        width < 576 -> "mobile"
        width < 992 -> "tablet"
        width < 1440 -> "laptop"
        else -> "desktop"
    }

    suspend fun storeEvent(clientIp: String?, event: Event) {
        val ipCity = GlobalScope.async {
            if (reader != null) {
                val ipAddress = InetAddress.getByName(clientIp)
                reader.tryCity(ipAddress)
            } else Optional.empty()
        }.await()

        val uri = URI.create(event.url)
        val userId: Long = container.hash("${event.domain}_${clientIp}_${event.userAgent}".toByteArray())

        val userAgent = uaa.parse(event.userAgent)
        val domain = event.domain?.removePrefix("www.") ?: uri.host.removePrefix("www.")

        // Drop notification if we're full
        if (!slackNotifier.events.offer(SlackNotifier.Event(domain, event.type))) {
            LOG.warn("Slack notification channel is full. Dropping.")
        }

        val parsedReferrer = referrerParser.parse(event.referrer, uri)
        val referrer = cleanReferrer(domain, event.referrer)
        val source = cleanSource(event.source, referrer, parsedReferrer)

        newSuspendedTransaction {
            Events.insert {
                it[type] = event.type
                it[Events.domain] = domain
                it[path] = uri.path ?: "/"
                it[city] = ipCity.map { it.city.name }.orElse(null)
                it[country] = ipCity.map { it.country.name }.orElse(null)
                it[isoCountryCode] = ipCity.map { it.country.isoCode }.orElse(null)
                it[Events.referrer] = event.referrer
                it[Events.referrerClean] = referrer
                it[source_] = event.source
                it[Events.sourceClean] = source
                it[Events.userAgent] = event.userAgent
                it[Events.deviceName] = userAgent.getValue(UserAgent.DEVICE_NAME)
                it[Events.deviceClass] = userAgent.getValue(UserAgent.DEVICE_CLASS)
                it[Events.agentName] = userAgent.getValue(UserAgent.AGENT_NAME)
                it[Events.operationGystemName] = userAgent.getValue(UserAgent.OPERATING_SYSTEM_NAME)
                it[screenWidth] = event.screenWidth
                it[device] = screenWidthToDevice(event.screenWidth)
                it[Events.userId] = userId
                it[time] = Instant.now()
                it[data] = emptyMap<String, Any>()
            }
        }
    }
}