package io.beampipe.server.db.util

import com.fasterxml.jackson.databind.ObjectMapper
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ColumnType
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.statements.api.PreparedStatementApi
import org.postgresql.util.PGobject

/**
 * Created by quangio.
 */

fun <T : Any> Table.jsonb(name: String, klass: Class<T>, jsonMapper: ObjectMapper): Column<T> =
    registerColumn(name, Json(klass, jsonMapper))

private class Json<T : Any>(private val klass: Class<T>, private val jsonMapper: ObjectMapper) : ColumnType<T>() {
    override fun sqlType() = "jsonb"

    override fun setParameter(stmt: PreparedStatementApi, index: Int, value: Any?) {
        val obj = PGobject()
        obj.type = "jsonb"
        obj.value = value as String
        stmt[index] = obj
    }

    override fun valueFromDB(value: Any): T {
        val pgValue = when (value) {
            is PGobject -> value.value
            is String -> value
            else -> {
                @Suppress("UNCHECKED_CAST")
                return value as T
            }
        }

        return try {
            jsonMapper.readValue(pgValue, klass)
        } catch (e: Exception) {
            e.printStackTrace()
            throw RuntimeException("Can't parse JSON: $value")
        }
    }

    override fun notNullValueToDB(value: T): Any = jsonMapper.writeValueAsString(value)
    override fun nonNullValueToString(value: T): String = "'${jsonMapper.writeValueAsString(value)}'"
}
