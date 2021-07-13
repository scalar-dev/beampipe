package io.beampipe.server

import com.maxmind.geoip2.DatabaseReader
import com.snowplowanalytics.refererparser.Parser
import io.beampipe.server.api.Event
import io.beampipe.server.api.cleanReferrer
import io.beampipe.server.api.cleanSource
import io.beampipe.server.db.Events
import io.beampipe.server.slack.SlackNotifier
import io.vertx.ext.web.Router
import io.vertx.ext.web.handler.BodyHandler
import io.vertx.ext.web.handler.CorsHandler
import io.vertx.kotlin.coroutines.CoroutineVerticle
import io.vertx.kotlin.coroutines.dispatcher
import io.whitfin.siphash.SipHasher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import nl.basjes.parse.useragent.UserAgent
import nl.basjes.parse.useragent.UserAgentAnalyzer
import org.apache.logging.log4j.LogManager
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import java.io.File
import java.net.InetAddress
import java.net.URI
import java.time.Instant
import java.util.*

class EventVerticle : CoroutineVerticle() {
    val log = LogManager.getLogger()
    val slackNotifier = SlackNotifier()
    val uaa = UserAgentAnalyzer
        .newBuilder()
        .hideMatcherLoadStats()
        .withCache(10000)
        .build()
    val referrerParser = Parser()
    val key: ByteArray = "0123456789ABCDEF".toByteArray()
    val container = SipHasher.container(key)


    private fun screenWidthToDevice(width: Int): String = when {
        width < 576 -> "mobile"
        width < 992 -> "tablet"
        width < 1440 -> "laptop"
        else -> "desktop"
    }

    private suspend fun storeEvent(reader: DatabaseReader?, clientIp: String?, event: Event) {
        val ipCity = withContext(Dispatchers.IO) {
            if (reader != null) {
                val ipAddress = InetAddress.getByName(clientIp)
                reader.tryCity(ipAddress)
            } else Optional.empty()
        }

        val uri = URI.create(event.url)
        val userId: Long = container.hash("${event.domain}_${clientIp}_${event.userAgent}".toByteArray())

        val userAgent = uaa.parse(event.userAgent)
        val domain = event.domain?.removePrefix("www.") ?: uri.host.removePrefix("www.")

        // Drop notification if we're full
        if (!slackNotifier.events.trySend(SlackNotifier.Event(domain, event.type)).isSuccess) {
            log.warn("Slack notification channel is full. Dropping.")
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
                it[referrerClean] = referrer
                it[source_] = event.source
                it[sourceClean] = source
                it[Events.userAgent] = event.userAgent
                it[deviceName] = userAgent.getValue(UserAgent.DEVICE_NAME)
                it[deviceClass] = userAgent.getValue(UserAgent.DEVICE_CLASS)
                it[agentName] = userAgent.getValue(UserAgent.AGENT_NAME)
                it[operationGystemName] = userAgent.getValue(UserAgent.OPERATING_SYSTEM_NAME)
                it[screenWidth] = event.screenWidth
                it[device] = screenWidthToDevice(event.screenWidth)
                it[Events.userId] = userId
                it[time] = Instant.now()
                it[data] = emptyMap<String, Any>()
            }
        }
    }

    override suspend fun start() {
        val router = Router.router(vertx)
        router.route().handler(CorsHandler.create("*"))
        router.route().handler(BodyHandler.create())

        val config = config.mapTo(Config::class.java)
        val database = if (config.GEOLITE2_DB_PATH != null) File(config.GEOLITE2_DB_PATH) else null
        val reader = if (database != null) DatabaseReader.Builder(database).build() else null

        router
            .post("/event")
            .handler { rc ->
                var ipAddress: String? = rc.request().getHeader("X-FORWARDED-FOR")
                if (ipAddress == null) {
                    ipAddress = rc.request().remoteAddress().hostAddress()
                }
                GlobalScope.launch(vertx.dispatcher()) {
                    storeEvent(reader, ipAddress, rc.bodyAsJson.mapTo(Event::class.java))
                    rc.response().setStatusCode(200).end()
                }
            }

        log.info("Starting event API")
        vertx.createHttpServer().requestHandler(router).listen(8081)
    }
}