package io.beampipe.server.db.util

import io.micronaut.context.annotation.Context
import org.jetbrains.exposed.sql.Database
import jakarta.annotation.PostConstruct
import jakarta.inject.Inject
import javax.sql.DataSource

@Context
class Database {
    @Inject
    lateinit var dataSource: DataSource

    @PostConstruct
    fun start() {
        Database.connect(dataSource)
    }
}