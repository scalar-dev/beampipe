package io.beampipe.server.graphql.util

import graphql.GraphQL
import io.beampipe.server.slack.logger
import io.micronaut.scheduling.annotation.Scheduled
import jakarta.inject.Singleton
import kotlin.system.exitProcess

/**
 * Exits the process if GraphQL stops working so the platform restarts us.
 *
 * The JVM caches a failed ResourceBundle lookup forever, so one transient failure while graphql-java
 * loads its i18n bundles leaves every later query failing until restart. Railway only checks
 * /health during deploys, so nothing else notices.
 */
@Singleton
class GraphQLSelfCheck(private val graphQL: GraphQL) {
    private val LOG = logger()
    private var consecutiveFailures = 0

    @Scheduled(fixedDelay = "1m", initialDelay = "1m")
    fun check() {
        val error = try {
            graphQL.execute("{ __typename }").errors.firstOrNull()?.message
        } catch (e: Exception) {
            LOG.error("GraphQL self-check threw", e)
            e.toString()
        }

        if (error == null) {
            consecutiveFailures = 0
            return
        }

        consecutiveFailures++
        LOG.error("GraphQL self-check failed ({}/{}): {}", consecutiveFailures, MAX_FAILURES, error)
        if (consecutiveFailures >= MAX_FAILURES) {
            LOG.error("GraphQL is broken, exiting so the process gets restarted")
            exitProcess(1)
        }
    }

    companion object {
        private const val MAX_FAILURES = 3
    }
}
