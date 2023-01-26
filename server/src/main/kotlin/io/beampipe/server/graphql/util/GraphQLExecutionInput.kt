package io.beampipe.server.graphql.util

import graphql.ExecutionInput
import io.micronaut.configuration.graphql.DefaultGraphQLExecutionInputCustomizer
import io.micronaut.configuration.graphql.GraphQLExecutionInputCustomizer
import io.micronaut.context.annotation.Replaces
import io.micronaut.core.async.publisher.Publishers
import io.micronaut.http.HttpRequest
import io.micronaut.http.MutableHttpResponse
import io.micronaut.http.server.util.HttpHostResolver
import io.micronaut.security.utils.SecurityService
import org.reactivestreams.Publisher
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
@Replaces(DefaultGraphQLExecutionInputCustomizer::class)
class GraphQLExecutionInput(@Inject val securityService: SecurityService?) : GraphQLExecutionInputCustomizer {
    @Inject
    lateinit var hostResolver: HttpHostResolver

    override fun customize(
        executionInput: ExecutionInput,
        httpRequest: HttpRequest<*>,
        httpResponse: MutableHttpResponse<String>?
    ): Publisher<ExecutionInput> {
        return Publishers.just(executionInput.transform { builder ->
            builder.context(Context(securityService?.authentication?.orElse(null), hostResolver.resolve(httpRequest)))
        })
    }
}