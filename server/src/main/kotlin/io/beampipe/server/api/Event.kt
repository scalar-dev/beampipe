package io.beampipe.server.api

data class Event(
    val type: String,
    val url: String,
    val domain: String?,
    val referrer: String,
    val source: String?,
    val userAgent: String,
    val screenWidth: Int
)