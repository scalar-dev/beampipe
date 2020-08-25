package io.beampipe.server.graphql

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import graphql.Assert
import graphql.language.ArrayValue
import graphql.language.BooleanValue
import graphql.language.EnumValue
import graphql.language.FloatValue
import graphql.language.IntValue
import graphql.language.NullValue
import graphql.language.ObjectValue
import graphql.language.StringValue
import graphql.language.Value
import graphql.language.VariableReference
import graphql.schema.Coercing
import graphql.schema.CoercingParseLiteralException
import graphql.schema.GraphQLScalarType
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Base64
import java.util.UUID
import java.util.stream.Collectors
import kotlin.reflect.jvm.internal.impl.resolve.constants.LongValue

object Scalars {
    val formatter = DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss Z yyyy")
    val localFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME
    val objectMapper = jacksonObjectMapper()
    init {
        objectMapper.registerModule(JavaTimeModule())
    }

    var uuid = GraphQLScalarType.newScalar()
            .name("UUID")
            .description("UUID")
            .coercing(object : Coercing<UUID, String> {
                override fun serialize(input: Any): String {
                    return input.toString()
                }

                override fun parseValue(input: Any): UUID {
                    return UUID.fromString(input as String)
                }

                override fun parseLiteral(input: Any): UUID? {
                    return if (input is StringValue) {
                        UUID.fromString(input.value)
                    } else {
                        null
                    }
                }
            })
            .build()
    var byteArray = GraphQLScalarType.newScalar()
            .name("ByteArray")
            .description("ByteArray")
            .coercing(object : Coercing<ByteArray, String> {
                override fun serialize(input: Any): String {
                    return Base64.getEncoder().encodeToString(input as ByteArray)
                }

                override fun parseValue(input: Any): ByteArray {
                    return Base64.getDecoder().decode(input as String)
                }

                override fun parseLiteral(input: Any): ByteArray? {
                    return if (input is StringValue) {
                        Base64.getDecoder().decode(input.value)
                    } else {
                        null
                    }
                }
            })
            .build()
    var dateTime = GraphQLScalarType.newScalar()
            .name("DateTime")
            .description("DataTime scalar")
            .coercing(object : Coercing<Instant, String> {
                override fun serialize(input: Any): String {
                    return DateTimeFormatter.ISO_INSTANT.format(input as Instant)
                }

                override fun parseValue(input: Any): Instant {
                    return Instant.parse(input.toString())
                }

                override fun parseLiteral(input: Any): Instant? {
                    return if (input is StringValue) {
                        return Instant.parse(input.value)
                    } else {
                        null
                    }
                }
            })
            .build()


    var localDateTime = GraphQLScalarType.newScalar()
            .name("LocalDateTime")
            .description("LocalDataTime scalar")
            .coercing(object : Coercing<LocalDateTime, String> {
                override fun serialize(input: Any): String {
                    return DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(input as LocalDateTime)
                }

                override fun parseValue(input: Any): LocalDateTime {
                    return LocalDateTime.parse(input.toString())
                }

                override fun parseLiteral(input: Any): LocalDateTime? {
                    return if (input is StringValue) {
                        return LocalDateTime.parse(input.value)
                    } else {
                        null
                    }
                }
            })
            .build()


    var zonedDateTime = GraphQLScalarType.newScalar()
            .name("ZonedDateTime")
            .description("ZonedDataTime scalar")
            .coercing(object : Coercing<ZonedDateTime, String> {
                override fun serialize(input: Any): String {
                    return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(input as ZonedDateTime)
                }

                override fun parseValue(input: Any): ZonedDateTime {
                    return ZonedDateTime.parse(input.toString())
                }

                override fun parseLiteral(input: Any): ZonedDateTime? {
                    return if (input is StringValue) {
                        return ZonedDateTime.parse(input.value)
                    } else {
                        null
                    }
                }
            })
            .build()

    var json = GraphQLScalarType.newScalar()
            .name("Json")
            .description("A JSON blob")
            .coercing(object : Coercing<Any, Any> {
                fun typeName(input: Any?): String {
                    return if (input == null) {
                        "null"
                    } else input.javaClass.simpleName
                }
                override fun serialize(input: Any) = input

                override fun parseValue(input: Any): Any = input

                override fun parseLiteral(input: Any) = parseLiteral(input, emptyMap())

                override fun parseLiteral(input: Any, variables: Map<String, Any>): Any? {
                    if (input !is Value<*>) {
                        throw CoercingParseLiteralException(
                                "Expected AST type 'StringValue' but was '" + typeName(input) + "'."
                        )
                    }
                    if (input is NullValue) {
                        return null
                    }
                    if (input is FloatValue) {
                        return input.value
                    }
                    if (input is StringValue) {
                        return input.value
                    }
                    if (input is IntValue) {
                        return input.value
                    }
                    if (input is BooleanValue) {
                        return input.isValue
                    }
                    if (input is EnumValue) {
                        return input.name
                    }
                    if (input is VariableReference) {
                        val varName = input.name
                        return variables[varName]
                    }
                    if (input is ArrayValue) {
                        val values = input.values
                        return values.stream()
                                .map { v -> parseLiteral(v, variables) }
                                .collect(Collectors.toList())
                    }
                    if (input is ObjectValue) {
                        val values = input.objectFields
                        val parsedValues = LinkedHashMap<String, Any?>()
                        values.forEach { fld ->
                            val parsedValue = parseLiteral(fld.value, variables)
                            parsedValues[fld.name] = parsedValue
                        }
                        return parsedValues
                    }
                    return Assert.assertShouldNeverHappen("We have covered all Value types")
                }
            })
            .build()
}
