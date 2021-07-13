package io.beampipe.server

import com.fasterxml.jackson.module.kotlin.KotlinModule
import io.beampipe.server.slack.SlackNotifier
import io.vertx.config.ConfigRetriever
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
        DatabindCodec.mapper().registerModule(KotlinModule())

        ConfigRetriever.create(vertx)
            .getConfig { retrievedConfig ->
                val mergedConfig = retrievedConfig.result().mergeIn(super.config)
                val config = mergedConfig.mapTo(Config::class.java)

                val connectOptions = JDBCConnectOptions()
                    .setJdbcUrl("jdbc:postgresql://${config.PGHOST}:${config.PGPORT}/${config.PGDATABASE}")
                    .setUser(config.PGUSER)
                    .setPassword(config.PGPASSWORD)

                val poolOptions = PoolOptions()
                    .setMaxSize(16)

                val dataSource = AgroalCPDataSourceProvider(connectOptions, poolOptions).getDataSource(null)

                log.info("Connecting to database: ${connectOptions.jdbcUrl}")
                Database.connect(dataSource)

                Flyway.configure().dataSource(dataSource).locations("classpath:databasemigrations")
                    .load()
                    .migrate()
                val deploymentOptions = DeploymentOptions().setConfig(mergedConfig)

                vertx.deployVerticle(GraphQLVerticle::class.java, deploymentOptions)
                    .onFailure { log.error("Failed to graphql API", it) }
                    .onSuccess { log.info("Deployed graphql API", it) }

                vertx.deployVerticle(EventVerticle::class.java, deploymentOptions)
                    .onFailure { log.error("Failed to deploy event API", it) }
                    .onSuccess { log.info("Deployed event API", it) }

                vertx.deployVerticle(SlackNotifier::class.java, deploymentOptions)
                    .onFailure { log.error("Failed to deploy slack notifier", it) }
                    .onSuccess { log.info("Deployed slack notifier", it) }
            }
    }
}

