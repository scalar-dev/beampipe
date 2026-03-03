package io.beampipe.server.graphql.util

import com.expediagroup.graphql.generator.SchemaGeneratorConfig
import com.expediagroup.graphql.generator.TopLevelObject
import com.expediagroup.graphql.generator.toSchema
import com.expediagroup.graphql.generator.hooks.SchemaGeneratorHooks
import graphql.GraphQL
import graphql.schema.GraphQLSchema
import graphql.schema.GraphQLType
import io.beampipe.server.graphql.AccountMutations
import io.beampipe.server.graphql.AccountQuery
import io.beampipe.server.graphql.DomainMutations
import io.beampipe.server.graphql.DomainQuery
import io.beampipe.server.graphql.EventQuery
import io.micronaut.context.annotation.Bean
import io.micronaut.context.annotation.Factory
import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.util.UUID
import kotlin.reflect.KClass
import kotlin.reflect.KFunction
import kotlin.reflect.KParameter
import kotlin.reflect.KType
import kotlin.reflect.full.valueParameters

@Factory
class GraphQLFactory(
    @Inject val eventQuery: EventQuery,
    @Inject val accountQuery: AccountQuery,
    @Inject val accountMutations: AccountMutations,
    @Inject val domainQuery: DomainQuery,
    @Inject val domainMutations: DomainMutations
) {
    @Bean
    @Singleton
    fun graphQL(): GraphQL {
        val config = SchemaGeneratorConfig(
            supportedPackages = listOf("io.beampipe"),
            hooks = object : SchemaGeneratorHooks {
                override fun willGenerateGraphQLType(type: KType): GraphQLType? = when (type.classifier as? KClass<*>) {
                    UUID::class -> Scalars.uuid
                    Long::class -> Scalars.long
                    Instant::class -> Scalars.dateTime
                    ZonedDateTime::class -> Scalars.zonedDateTime
                    LocalDateTime::class -> Scalars.localDateTime
                    ByteArray::class -> Scalars.byteArray
                    Any::class -> Scalars.json
                    Map::class -> Scalars.json
                    else -> null
                }

                override fun isValidFunction(kClass: KClass<*>, function: KFunction<*>): Boolean {
                    return super.isValidFunction(kClass, function)
                }
            },
            dataFetcherFactoryProvider = ContextAwareDataFetcherFactoryProvider()
        )

        val queries = listOf(
            TopLevelObject(eventQuery),
            TopLevelObject(accountQuery),
            TopLevelObject(domainQuery)
        )

        val mutations = listOf(
            TopLevelObject(accountMutations),
            TopLevelObject(domainMutations)
        )

        val schema =
            GraphQLSchema.newSchema(toSchema(config, queries, mutations)).additionalType(Scalars.dateTime).build()

        // Return the GraphQL bean.
        return GraphQL.newGraphQL(schema).build()
    }
}
