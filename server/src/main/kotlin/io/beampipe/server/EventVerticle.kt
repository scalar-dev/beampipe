package io.beampipe.server

import io.beampipe.server.api.EventEndpoint
import io.beampipe.server.slack.SlackNotifier
import io.vertx.ext.web.Router
import io.vertx.ext.web.handler.BodyHandler
import io.vertx.kotlin.coroutines.CoroutineVerticle
import io.vertx.kotlin.coroutines.dispatcher
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.apache.logging.log4j.LogManager

class EventVerticle : CoroutineVerticle() {
    val log = LogManager.getLogger()

    override suspend fun start() {
        val router = Router.router(vertx)
        router.route().handler(BodyHandler.create())
        val slackNotifier = SlackNotifier()
        val eventEndpoint = EventEndpoint(null, slackNotifier)

        router.post("/event")
            .handler { rc ->
                var ipAddress: String? = rc.request().getHeader("X-FORWARDED-FOR")
                if (ipAddress == null) {
                    ipAddress = rc.request().remoteAddress().hostAddress()
                }
                GlobalScope.launch(vertx.dispatcher()) {
                    eventEndpoint.storeEvent(ipAddress, rc.bodyAsJson.mapTo(EventEndpoint.Event::class.java))
                }
            }

        log.info("Starting event API")
        vertx.createHttpServer().requestHandler(router).listen(8081)
    }
}