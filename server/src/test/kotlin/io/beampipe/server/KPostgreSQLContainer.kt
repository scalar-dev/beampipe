package server

import org.testcontainers.containers.PostgreSQLContainer

// See https://github.com/testcontainers/testcontainers-java/issues/318#issuecomment-290692749
class KPostgreSQLContainer() : PostgreSQLContainer<KPostgreSQLContainer>("timescale/timescaledb:latest-pg12")
