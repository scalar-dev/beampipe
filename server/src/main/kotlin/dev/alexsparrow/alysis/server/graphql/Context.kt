package dev.alexsparrow.alysis.server.graphql

import com.expediagroup.graphql.execution.GraphQLContext
import io.micronaut.security.authentication.Authentication

data class Context(val authentication: Authentication?, val host: String): GraphQLContext
