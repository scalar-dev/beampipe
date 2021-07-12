package io.beampipe.server.graphql.util

import com.expediagroup.graphql.generator.annotations.GraphQLDirective
import com.expediagroup.graphql.generator.directives.KotlinFieldDirectiveEnvironment
import com.expediagroup.graphql.generator.directives.KotlinSchemaDirectiveWiring
import graphql.GraphQLException
import graphql.schema.DataFetcher
import graphql.schema.DataFetchingEnvironment
import graphql.schema.GraphQLFieldDefinition

@GraphQLDirective(name = "loginRequired", description = "You must login to use this")
annotation class LoginRequired()

class LoginRequiredSchemaDirectiveWiring : KotlinSchemaDirectiveWiring {
    override fun onField(environment: KotlinFieldDirectiveEnvironment): GraphQLFieldDefinition {
        val field = environment.element
        val originalDataFetcher: DataFetcher<*> = environment.getDataFetcher()
        environment.setDataFetcher { dataFetchingEnvironment: DataFetchingEnvironment ->
            if ((dataFetchingEnvironment.getContext() as Context).user != null) {
                originalDataFetcher.get(dataFetchingEnvironment)
            } else {
                throw GraphQLException("You must be logged in to access this field")
            }
        }

        return field
    }
}
