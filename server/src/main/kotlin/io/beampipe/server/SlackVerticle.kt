package io.beampipe.server

import com.slack.api.bolt.AppConfig
import io.beampipe.server.slack.SlackApp
import io.beampipe.server.slack.VertxSlackApp
import io.vertx.ext.web.Router
import io.vertx.ext.web.handler.BodyHandler
import io.vertx.kotlin.coroutines.CoroutineVerticle

class SlackVerticle : CoroutineVerticle() {
    override suspend fun start() {
        val router =   Router.router(vertx)
        val slackApp = SlackApp(AppConfig(), vertx)

        router.route().handler(BodyHandler.create())
        router.route("/slack/events")
            .handler(VertxSlackApp(slackApp.app))

        vertx.createHttpServer().requestHandler(router).listen(8082)
    }
}