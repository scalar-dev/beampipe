package server

import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

// See https://github.com/testcontainers/testcontainers-java/issues/318#issuecomment-290692749
class KPostgreSQLContainer() : PostgreSQLContainer<KPostgreSQLContainer>(
    DockerImageName.parse("timescale/timescaledb:latest-pg12").asCompatibleSubstituteFor("postgres")
)
