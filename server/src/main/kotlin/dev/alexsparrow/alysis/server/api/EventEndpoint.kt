package dev.alexsparrow.alysis.server.api

import com.maxmind.geoip2.DatabaseReader
import dev.alexsparrow.alysis.server.db.Events
import io.micronaut.context.annotation.Property
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.MutableHttpResponse
import io.micronaut.http.annotation.Body
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Post
import io.micronaut.http.server.util.HttpClientAddressResolver
import io.micronaut.security.annotation.Secured
import io.micronaut.security.rules.SecurityRule
import io.whitfin.siphash.SipHasher
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.slf4j.LoggerFactory
import java.io.File
import java.net.InetAddress
import java.net.URI
import java.time.Instant
import javax.inject.Inject


@Controller("/event")
@Secured(SecurityRule.IS_ANONYMOUS)
class EventEndpoint(@Property(name = "geolite2.db") val geoLite2DbPath: String) {
    val LOG = LoggerFactory.getLogger(EventEndpoint::class.java)

    @Inject
    lateinit var clientAddressResolver: HttpClientAddressResolver

    var key: ByteArray = "0123456789ABCDEF".toByteArray()
    var container = SipHasher.container(key)

    var database = File(geoLite2DbPath)
    var reader = DatabaseReader.Builder(database).build()

    data class Event(
            val type: String,
            val url: String,
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

        newSuspendedTransaction{
            Events.insert {
                it[type] = event.type
                it[domain] = uri.host.removePrefix("www.")
                it[path] = uri.path ?: "/"
                it[city] = ipCity.map { it.city.name }.orElse(null)
                it[country] = ipCity.map { it.country.name }.orElse(null)
                it[referrer] = event.referrer
                it[source_] = event.source
                it[userAgent] = event.userAgent
                it[screenWidth] = event.screenWidth
                it[device] = screenWidthToDevice(event.screenWidth)
                it[userId] = container.hash("${domain}_${clientIp}_${userAgent}".toByteArray())
                it[time] = Instant.now()
                it[data] = emptyMap<String, Any>()
            }
        }
    }

    @Post
    suspend fun post(request: HttpRequest<*>, @Body event: Event): MutableHttpResponse<String>? {
        val clientIp = clientAddressResolver.resolve(request)

        try {
            storeEvent(clientIp, event)
        } catch (e: Exception) {
            LOG.error("Exception while storing event", e)
            return HttpResponse.serverError<String>()
        }

        return HttpResponse.ok()
    }
}