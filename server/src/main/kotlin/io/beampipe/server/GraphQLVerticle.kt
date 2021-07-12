package io.beampipe.server

import com.expediagroup.graphql.generator.SchemaGeneratorConfig
import com.expediagroup.graphql.generator.TopLevelObject
import com.expediagroup.graphql.generator.directives.KotlinDirectiveWiringFactory
import com.expediagroup.graphql.generator.directives.KotlinSchemaDirectiveWiring
import com.expediagroup.graphql.generator.execution.SimpleKotlinDataFetcherFactoryProvider
import com.expediagroup.graphql.generator.hooks.SchemaGeneratorHooks
import com.expediagroup.graphql.generator.toSchema
import graphql.GraphQL
import graphql.schema.GraphQLSchema
import graphql.schema.GraphQLType
import io.beampipe.server.auth.CookieToBearerTokenHandler
import io.beampipe.server.auth.PermissiveJWTAuthHandler
import io.beampipe.server.auth.UsernamePasswordAuthenticationProvider
import io.beampipe.server.graphql.*
import io.beampipe.server.graphql.util.Context
import io.beampipe.server.graphql.util.LoginRequiredSchemaDirectiveWiring
import io.beampipe.server.graphql.util.Scalars
import io.beampipe.server.stripe.StripeHandler
import io.vertx.core.http.Cookie
import io.vertx.core.json.JsonObject
import io.vertx.core.json.jackson.DatabindCodec
import io.vertx.ext.auth.PubSecKeyOptions
import io.vertx.ext.auth.jwt.JWTAuth
import io.vertx.ext.auth.jwt.JWTAuthOptions
import io.vertx.ext.web.Router
import io.vertx.ext.web.common.WebEnvironment
import io.vertx.ext.web.handler.BodyHandler
import io.vertx.ext.web.handler.graphql.GraphQLHandler
import io.vertx.ext.web.handler.graphql.GraphiQLHandler
import io.vertx.ext.web.handler.graphql.GraphiQLHandlerOptions
import io.vertx.kotlin.coroutines.CoroutineVerticle
import org.apache.logging.log4j.LogManager
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.util.*
import kotlin.reflect.KClass
import kotlin.reflect.KType

class GraphQLVerticle : CoroutineVerticle() {
    val log = LogManager.getLogger()

    fun graphQL(jwtAuth: JWTAuth): GraphQL {
        val accountQuery = AccountQuery()
        val eventQuery = EventQuery(accountQuery)
        val domainQuery = DomainQuery()
        val accountMutations = AccountMutations("price_1H9wLyKrGSqzIeMTIkqhJVDa", jwtAuth)
        val domainMutations = DomainMutations()

        val customWiringFactory = KotlinDirectiveWiringFactory(
            manualWiring = mapOf<String, KotlinSchemaDirectiveWiring>("loginRequired" to LoginRequiredSchemaDirectiveWiring())
        )

        val config = SchemaGeneratorConfig(
            supportedPackages = listOf("io.beampipe"),
            hooks = object : SchemaGeneratorHooks {
                override val wiringFactory: KotlinDirectiveWiringFactory
                    get() = customWiringFactory

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

            dataFetcherFactoryProvider = SimpleKotlinDataFetcherFactoryProvider(DatabindCodec.mapper())
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

    override suspend fun start() {
        val router = Router.router(vertx)
        router.route().handler(BodyHandler.create())


        val auth = UsernamePasswordAuthenticationProvider(vertx)

        val jwtAuth: JWTAuth = JWTAuth.create(
            vertx, JWTAuthOptions()
                .addPubSecKey(
                    PubSecKeyOptions()
                        .setAlgorithm("HS256")
                        .setBuffer("keyboard cat")
                )
        )

        router.route("/login")
            .handler { rc ->
                auth.authenticate(rc.bodyAsJson)
                    .onSuccess {
                        rc.addCookie(
                            Cookie.cookie("JWT", jwtAuth.generateToken(it.principal()))
                                .setSecure(true)
                                .setHttpOnly(true)
                        )

                        rc.response().setStatusCode(200).end()
                    }
                    .onFailure {
                        rc.response().setStatusCode(401).end()
                    }
            }

        // TODO: Fix
//        router.route("/stripe")
//            .handler(StripeHandler())

        if (WebEnvironment.development()) {
            log.info("Development mode!!")
            val devToken = jwtAuth.generateToken(
                JsonObject(
                    mapOf(
                        "sub" to "devuser",
                        "accountId" to UUID.randomUUID().toString()
                    )
                )
            )

            val options = GraphiQLHandlerOptions().setEnabled(true)
                .setHeaders(mapOf("Authorization" to "Bearer $devToken"))
            router.route("/graphiql/*").handler(GraphiQLHandler.create(options))
        }

        router.route("/graphql")
            .handler(CookieToBearerTokenHandler())
            .handler(PermissiveJWTAuthHandler(jwtAuth))
            .handler(
                GraphQLHandler.create(graphQL(jwtAuth))
                .queryContext { rc ->
                    val host: String = rc.request().host()
                    Context(rc.user(), host)
                }
            )

        log.info("Starting graphql API")
        vertx.createHttpServer().requestHandler(router).listen(8080)
    }
}