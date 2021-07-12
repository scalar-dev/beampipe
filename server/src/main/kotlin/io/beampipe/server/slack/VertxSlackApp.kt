package io.beampipe.server.slack

import com.slack.api.bolt.App
import com.slack.api.bolt.request.Request
import com.slack.api.bolt.response.Response
import com.slack.api.bolt.util.SlackRequestParser
import io.vertx.core.Handler
import io.vertx.core.http.HttpServerRequest
import io.vertx.core.http.HttpServerResponse
import io.vertx.ext.web.RoutingContext

class VertxSlackApp(val app: App) : Handler<RoutingContext> {
    private val requestParser = SlackRequestParser(app.config())

    override fun handle(event: RoutingContext) {
        val request = toSlackRequest(event.request())
        return toVertxResponse(app.run(request), event.response())
    }

    private fun toVertxResponse(slackResponse: Response, response: HttpServerResponse) {
        response.statusCode = slackResponse.statusCode

        slackResponse.headers.forEach { header ->
            response.putHeader(header.key, header.value)
        }

        response.send(slackResponse.body)
        response.putHeader("Content-Type", slackResponse.contentType)

        if (slackResponse.body != null) {
            response.putHeader("Content-Length", slackResponse.body.length.toString())
        } else {
            response.putHeader("Content-Length", "0")
        }

        response.end()
    }

    private fun toSlackRequest(request: HttpServerRequest): Request<*>? {
        val queryParams = request.params().names().associateWith { request.params().getAll(it) }

        val rawRequest = SlackRequestParser.HttpRequest.builder()
            .requestUri(request.path())
            .queryString(queryParams)
            .build()

        return requestParser.parse(rawRequest)
    }
}