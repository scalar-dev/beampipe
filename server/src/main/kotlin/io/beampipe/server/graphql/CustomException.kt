package io.beampipe.server.graphql

import graphql.ErrorType
import graphql.GraphQLError
import graphql.language.SourceLocation
import java.lang.RuntimeException

// See: https://stackoverflow.com/questions/51185242/runtimeexception-and-graphqlerror-in-kotlin-and-java
class CustomException(@JvmField override val message: String) : GraphQLError, RuntimeException() {
    override fun getMessage(): String = message

    override fun getErrorType() = ErrorType.ExecutionAborted
    override fun getExtensions(): Map<String, Any> {
        return mapOf("userMessage" to message)
    }

    override fun getLocations() = emptyList<SourceLocation>()
}