package server

import org.testcontainers.postgresql.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

class KPostgreSQLContainer() : PostgreSQLContainer(
    DockerImageName.parse("timescale/timescaledb:latest-pg14").asCompatibleSubstituteFor("postgres")
)
