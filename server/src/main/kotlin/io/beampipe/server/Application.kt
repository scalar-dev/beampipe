package io.beampipe.server

import com.fasterxml.jackson.module.kotlin.KotlinModule
import io.beampipe.server.slack.SlackNotifier
import io.vertx.core.DeploymentOptions
import io.vertx.core.json.jackson.DatabindCodec
import io.vertx.jdbcclient.JDBCConnectOptions
import io.vertx.jdbcclient.impl.AgroalCPDataSourceProvider
import io.vertx.kotlin.coroutines.CoroutineVerticle
import io.vertx.sqlclient.PoolOptions
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database

class Application : CoroutineVerticle() {
    private val log: Logger = LogManager.getLogger()

    override suspend fun start() {
        val connectOptions = JDBCConnectOptions()
            .setJdbcUrl("jdbc:postgresql://localhost:5432/postgres")
            .setUser("postgres")
            .setPassword("postgres")

        val poolOptions = PoolOptions()
            .setMaxSize(16)

        val dataSource = AgroalCPDataSourceProvider(connectOptions, poolOptions).getDataSource(null)

        Flyway.configure().dataSource(dataSource).locations("classpath:databasemigrations")
            .load()
            .migrate()

        DatabindCodec.mapper().registerModule(KotlinModule())

        log.info("Connecting to database")
        Database.connect(dataSource)

        vertx.deployVerticle(GraphQLVerticle::class.java, DeploymentOptions())
            .onFailure { log.error("Failed to graphql API", it) }
            .onSuccess { log.info("Deployed graphql API", it) }

        vertx.deployVerticle(EventVerticle::class.java, DeploymentOptions())
            .onFailure { log.error("Failed to deploy event API", it) }
            .onSuccess { log.info("Deployed event API", it) }

        vertx.deployVerticle(SlackNotifier::class.java, DeploymentOptions())
            .onFailure { log.error("Failed to deploy slack notifier", it) }
            .onSuccess { log.info("Deployed slack notifier", it) }
    }
}

