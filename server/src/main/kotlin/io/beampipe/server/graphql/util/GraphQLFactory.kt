package io.beampipe.server.graphql.util

import com.expediagroup.graphql.SchemaGeneratorConfig
import com.expediagroup.graphql.TopLevelObject
import com.expediagroup.graphql.execution.SimpleKotlinDataFetcherFactoryProvider
import com.expediagroup.graphql.hooks.SchemaGeneratorHooks
import com.expediagroup.graphql.toSchema
import com.fasterxml.jackson.databind.ObjectMapper
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
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.reflect.KClass
import kotlin.reflect.KType

@Factory
class GraphQLFactory(
    @Inject val eventQuery: EventQuery,
    @Inject val accountQuery: AccountQuery,
    @Inject val accountMutations: AccountMutations,
    @Inject val domainQuery: DomainQuery,
    @Inject val domainMutations: DomainMutations,
    @Inject val objectMapper: ObjectMapper
) {
    @Bean
    @Singleton
    fun graphQL(): GraphQL {
        val config = SchemaGeneratorConfig(
            supportedPackages = listOf("io.beampipe"),
            hooks = object : SchemaGeneratorHooks {
                override fun willGenerateGraphQLType(type: KType): GraphQLType? = when (type.classifier as? KClass<*>) {
                    UUID::class -> Scalars.uuid
                    Instant::class -> Scalars.dateTime
                    ZonedDateTime::class -> Scalars.zonedDateTime
                    LocalDateTime::class -> Scalars.localDateTime
                    ByteArray::class -> Scalars.byteArray
                    Any::class -> Scalars.json
                    Map::class -> Scalars.json
                    else -> super.willGenerateGraphQLType(type)
                }
            },
            dataFetcherFactoryProvider = SimpleKotlinDataFetcherFactoryProvider(objectMapper)
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
