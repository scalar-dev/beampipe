package io.beampipe.server.api

import com.snowplowanalytics.refererparser.Referer
import java.net.URI
import java.net.URISyntaxException

fun safeParseURI(uri: String?) = try {
    if (uri != null) {
        URI.create(uri)
    } else {
        null
    }
} catch (e: URISyntaxException) {
    null
}

fun cleanReferrer(host: String?, referrer: String?): String? {
    val referrerURI = safeParseURI(referrer)

    if (referrerURI != null && referrerURI.host != null) {
        val referrerHost = referrerURI.host.removePrefix("www.")

        if (host != null && (host.removePrefix("www.") == referrerHost || referrerHost == "localhost")) {
            return null
        } else {
            return referrerHost
        }
    } else {
        return null
    }
}

fun cleanSource(source: String?, referrer: String?, parsedReferrer: Referer?): String? {
    if (source != null && source.isNotBlank()) {
        return source
    }

    if (parsedReferrer?.source != null) {
        return parsedReferrer.source
    }

    val referrerUri = safeParseURI(referrer)

    if (referrerUri?.host != null) {
        return referrerUri.host.removePrefix("www.")
    }

    return null
}