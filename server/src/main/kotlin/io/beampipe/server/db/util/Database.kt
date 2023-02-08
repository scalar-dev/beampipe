package io.beampipe.server.db.util

import io.micronaut.context.annotation.Context
import jakarta.inject.Inject
import org.jetbrains.exposed.sql.Database
import javax.annotation.PostConstruct
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