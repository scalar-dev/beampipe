package io.beampipe.server.api

import com.maxmind.geoip2.DatabaseReader
import com.snowplowanalytics.refererparser.Parser
import io.beampipe.server.db.Events
import io.beampipe.server.slack.SlackNotifier
import io.beampipe.server.slack.logger
import io.micronaut.context.annotation.Property
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.MutableHttpResponse
import io.micronaut.http.annotation.Body
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Options
import io.micronaut.http.annotation.Post
import io.micronaut.http.server.util.HttpClientAddressResolver
import io.micronaut.security.annotation.Secured
import io.micronaut.security.rules.SecurityRule
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
import javax.inject.Inject


@Controller("/event")
@Secured(SecurityRule.IS_ANONYMOUS)
class EventEndpoint(@Property(name = "geolite2.db") val geoLite2DbPath: String) {
    val LOG = logger()

    @Inject
    lateinit var clientAddressResolver: HttpClientAddressResolver

    @Inject
    lateinit var slackNotifier: SlackNotifier

    val uaa = UserAgentAnalyzer
        .newBuilder()
        .hideMatcherLoadStats()
        .withCache(10000)
        .build()

    val referrerParser = Parser()

    var key: ByteArray = "0123456789ABCDEF".toByteArray()
    var container = SipHasher.container(key)

    var database = File(geoLite2DbPath)
    var reader = DatabaseReader.Builder(database).build()

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
            val ipAddress = InetAddress.getByName(clientIp)
            reader.tryCity(ipAddress)
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

    @Options
    fun options(): MutableHttpResponse<String>? = corsPreflight()

    @Post
    suspend fun post(request: HttpRequest<*>, @Body event: Event): MutableHttpResponse<String>? {
        val clientIp = clientAddressResolver.resolve(request)

        try {
            storeEvent(clientIp, event)
        } catch (e: Exception) {
            LOG.error("Exception while storing event", e)
            return HttpResponse.serverError<String>()
        }

        return corsOk()
    }
}