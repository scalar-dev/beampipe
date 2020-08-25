package io.beampipe.server.api

import io.micronaut.http.HttpResponse
import io.micronaut.http.MutableHttpResponse

fun <T> MutableHttpResponse<T>.corsHeaders() = this
    .header("Access-Control-Allow-Origin", "*")
    .header("Access-Control-Allow-Methods", "POST, OPTIONS")
    .header(
        "Access-Control-Allow-Headers",
        "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range"
    )

fun corsOk() = HttpResponse
    .noContent<String>()
    .corsHeaders()
    .header(
        "Access-Control-Expose-Headers",
        "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range"
    )

fun corsPreflight() = HttpResponse
    .noContent<String>()
    .corsHeaders()
    .header("Access-Control-Max-Age", "1728000")
