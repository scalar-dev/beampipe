package io.beampipe.server.graphql.util

import com.expediagroup.graphql.generator.execution.FunctionDataFetcher
import com.expediagroup.graphql.generator.execution.SimpleKotlinDataFetcherFactoryProvider
import graphql.schema.DataFetcherFactory
import graphql.schema.DataFetchingEnvironment
import kotlin.reflect.KClass
import kotlin.reflect.KFunction
import kotlin.reflect.KParameter

class ContextAwareDataFetcherFactoryProvider : SimpleKotlinDataFetcherFactoryProvider() {
    override fun functionDataFetcherFactory(target: Any?, kClass: KClass<*>, kFunction: KFunction<*>): DataFetcherFactory<Any?> {
        return DataFetcherFactory {
            ContextAwareDataFetcher(target, kFunction)
        }
    }
}

class ContextAwareDataFetcher(
    target: Any?,
    fn: KFunction<*>
) : FunctionDataFetcher(target, fn) {
    override fun mapParameterToValue(param: KParameter, environment: DataFetchingEnvironment): Pair<KParameter, Any?>? {
        if (param.type.classifier == Context::class) {
            val ctx = environment.graphQlContext.get<Context>("beampipeContext")
            return param to ctx
        }
        val result = super.mapParameterToValue(param, environment)
        // graphql-kotlin 8 skips parameters not present in the query arguments.
        // For nullable Kotlin parameters without defaults, we need to pass null explicitly.
        if (result == null && param.type.isMarkedNullable) {
            return param to null
        }
        return result
    }
}
