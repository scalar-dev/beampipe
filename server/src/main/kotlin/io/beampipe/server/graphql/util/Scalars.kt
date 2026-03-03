package io.beampipe.server.graphql.util

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import graphql.Assert
import graphql.GraphQLContext
import graphql.execution.CoercedVariables
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
import java.util.Locale
import java.util.UUID
import java.util.stream.Collectors

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
            override fun serialize(input: Any, context: GraphQLContext, locale: Locale): String {
                return input.toString()
            }

            override fun parseValue(input: Any, context: GraphQLContext, locale: Locale): UUID {
                return UUID.fromString(input as String)
            }

            override fun parseLiteral(input: Value<*>, variables: CoercedVariables, context: GraphQLContext, locale: Locale): UUID? {
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
            override fun serialize(input: Any, context: GraphQLContext, locale: Locale): String {
                return Base64.getEncoder().encodeToString(input as ByteArray)
            }

            override fun parseValue(input: Any, context: GraphQLContext, locale: Locale): ByteArray {
                return Base64.getDecoder().decode(input as String)
            }

            override fun parseLiteral(input: Value<*>, variables: CoercedVariables, context: GraphQLContext, locale: Locale): ByteArray? {
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
            override fun serialize(input: Any, context: GraphQLContext, locale: Locale): String {
                return DateTimeFormatter.ISO_INSTANT.format(input as Instant)
            }

            override fun parseValue(input: Any, context: GraphQLContext, locale: Locale): Instant {
                return Instant.parse(input.toString())
            }

            override fun parseLiteral(input: Value<*>, variables: CoercedVariables, context: GraphQLContext, locale: Locale): Instant? {
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
            override fun serialize(input: Any, context: GraphQLContext, locale: Locale): String {
                return DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(input as LocalDateTime)
            }

            override fun parseValue(input: Any, context: GraphQLContext, locale: Locale): LocalDateTime {
                return LocalDateTime.parse(input.toString())
            }

            override fun parseLiteral(input: Value<*>, variables: CoercedVariables, context: GraphQLContext, locale: Locale): LocalDateTime? {
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
            override fun serialize(input: Any, context: GraphQLContext, locale: Locale): String {
                return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(input as ZonedDateTime)
            }

            override fun parseValue(input: Any, context: GraphQLContext, locale: Locale): ZonedDateTime {
                return ZonedDateTime.parse(input.toString())
            }

            override fun parseLiteral(input: Value<*>, variables: CoercedVariables, context: GraphQLContext, locale: Locale): ZonedDateTime? {
                return if (input is StringValue) {
                    return ZonedDateTime.parse(input.value)
                } else {
                    null
                }
            }
        })
        .build()

    var long = GraphQLScalarType.newScalar()
        .name("Long")
        .description("Long scalar")
        .coercing(object : Coercing<Long, Long> {
            override fun serialize(input: Any, context: GraphQLContext, locale: Locale): Long = when (input) {
                is Long -> input
                is Number -> input.toLong()
                else -> throw graphql.schema.CoercingSerializeException("Expected a Number but got ${input::class}")
            }

            override fun parseValue(input: Any, context: GraphQLContext, locale: Locale): Long = when (input) {
                is Long -> input
                is Number -> input.toLong()
                is String -> input.toLong()
                else -> throw graphql.schema.CoercingParseValueException("Expected a Number but got ${input::class}")
            }

            override fun parseLiteral(input: Value<*>, variables: CoercedVariables, context: GraphQLContext, locale: Locale): Long? {
                return when (input) {
                    is IntValue -> input.value.toLong()
                    is StringValue -> input.value.toLong()
                    else -> null
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

            override fun serialize(input: Any, context: GraphQLContext, locale: Locale) = input

            override fun parseValue(input: Any, context: GraphQLContext, locale: Locale): Any = input

            override fun parseLiteral(input: Value<*>, variables: CoercedVariables, context: GraphQLContext, locale: Locale): Any? {
                return parseLiteralValue(input, emptyMap())
            }

            fun parseLiteralValue(input: Any, variables: Map<String, Any>): Any? {
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
                        .map { v -> parseLiteralValue(v, variables) }
                        .collect(Collectors.toList())
                }
                if (input is ObjectValue) {
                    val values = input.objectFields
                    val parsedValues = LinkedHashMap<String, Any?>()
                    values.forEach { fld ->
                        val parsedValue = parseLiteralValue(fld.value, variables)
                        parsedValues[fld.name] = parsedValue
                    }
                    return parsedValues
                }
                return Assert.assertShouldNeverHappen("We have covered all Value types")
            }
        })
        .build()
}
