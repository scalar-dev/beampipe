package dev.alexsparrow.alysis.server.db

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.`java-time`.timestamp
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.ExpressionWithColumnType
import org.jetbrains.exposed.sql.IColumnType
import org.jetbrains.exposed.sql.QueryBuilder
import org.jetbrains.exposed.sql.SqlExpressionBuilder
import org.jetbrains.exposed.sql.`java-time`.JavaInstantColumnType
import org.jetbrains.exposed.sql.append
import java.time.Instant

class TimeBucket(val expr1: Expression<*>, val expr2: Expression<*>) : ExpressionWithColumnType<Instant>() {
    override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder {
            append("time_bucket(",expr1, ",", expr2, ")")
        }
    }

    override val columnType: IColumnType = JavaInstantColumnType()
}


class TimeBucketGapFill(val expr1: Expression<*>, val expr2: Expression<*>) : ExpressionWithColumnType<Instant>() {
    override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder {
            append("time_bucket_gapfill(",expr1, ",", expr2, ")")
        }
    }

    override val columnType: IColumnType = JavaInstantColumnType()
}

fun SqlExpressionBuilder.timeBucket(expr1: Expression<*>, expr2: Expression<*>) = TimeBucket(expr1, expr2)

fun Table.defaultObjectMapper(): ObjectMapper {
    val objectMapper = jacksonObjectMapper()
    objectMapper.registerModule(JavaTimeModule())
    return objectMapper
}

object Events : UUIDTable("event") {
    val time = timestamp("time")
    val type = varchar("type", 64)
    val city = varchar("city", 1024).nullable()
    val country = varchar("country", 1024).nullable()
    val domain = varchar("domain", 1024)
    val path = varchar("path", 1024)
    val userId = long("user_id")
    val device = varchar("device", 64)
    val referrer = varchar("referrer", 1024)
    val source_ = varchar("source", 1024).nullable()
    val userAgent = varchar("user_agent", 1024)
    val screenWidth = integer("screen_width")
    val data = jsonb("data", Map::class.java, defaultObjectMapper()).nullable()
}
