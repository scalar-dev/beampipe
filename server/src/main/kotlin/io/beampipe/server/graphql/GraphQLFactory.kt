package io.beampipe.server.graphql

import com.expediagroup.graphql.SchemaGeneratorConfig
import com.expediagroup.graphql.TopLevelObject
import com.expediagroup.graphql.hooks.SchemaGeneratorHooks
import com.expediagroup.graphql.toSchema
import graphql.GraphQL
import graphql.schema.GraphQLSchema
import graphql.schema.GraphQLType
import io.micronaut.context.annotation.Bean
import io.micronaut.context.annotation.Factory
import java.time.Instant
import java.time.LocalDateTime
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.reflect.KClass
import kotlin.reflect.KType

@Factory
class GraphQLFactory {
    @Inject
    lateinit var eventsApi: EventsApi

    @Inject
    lateinit var userApi: UserApi

    @Inject
    lateinit var accountApi: AccountApi

    @Bean
    @Singleton
    fun graphQL(): GraphQL {
        val config = SchemaGeneratorConfig(supportedPackages = listOf("io.beampipe"),
                hooks = object : SchemaGeneratorHooks {
                    override fun willGenerateGraphQLType(type: KType): GraphQLType? = when (type.classifier as? KClass<*>) {
                        UUID::class -> Scalars.uuid
                        Instant::class -> Scalars.dateTime
                        LocalDateTime::class -> Scalars.localDateTime
                        ByteArray::class -> Scalars.byteArray
                        Any::class -> Scalars.json
                        Map::class -> Scalars.json
                        else -> super.willGenerateGraphQLType(type)
                    }
                }
        )

        val queries = listOf(
                TopLevelObject(eventsApi),
                TopLevelObject(userApi)
        )

        val mutations = listOf(
                TopLevelObject(accountApi)
        )

        val schema = GraphQLSchema.newSchema(toSchema(config, queries, mutations)).additionalType(Scalars.dateTime).build()

        // Return the GraphQL bean.
        return GraphQL.newGraphQL(schema).build()
    }
}
