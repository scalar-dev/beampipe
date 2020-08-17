package io.beampipe.server.db.util

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ColumnType
import org.jetbrains.exposed.sql.Expression
import org.jetbrains.exposed.sql.ExpressionWithColumnType
import org.jetbrains.exposed.sql.Function
import org.jetbrains.exposed.sql.IColumnType
import org.jetbrains.exposed.sql.IntegerColumnType
import org.jetbrains.exposed.sql.QueryBuilder
import org.jetbrains.exposed.sql.SqlExpressionBuilder
import org.jetbrains.exposed.sql.Table
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

fun Column<*>.distinctOn(): Function<Int> = DistinctOn(this)

class DistinctOn(val expr: Expression<*>) : org.jetbrains.exposed.sql.Function<Int>(IntegerColumnType()) {
    override fun toQueryBuilder(queryBuilder: QueryBuilder) {
        queryBuilder {
            append("DISTINCT ON (", expr, ")", expr)
        }
    }
}
