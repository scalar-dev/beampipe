package io.beampipe.server.api

import io.micronaut.context.annotation.Requires
import io.micronaut.http.HttpRequest
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Error
import io.micronaut.http.annotation.Produces
import io.micronaut.http.hateoas.JsonError
import io.micronaut.http.server.types.files.StreamedFile
import io.micronaut.security.annotation.Secured
import io.micronaut.security.rules.SecurityRule

@Controller
@Secured(SecurityRule.IS_ANONYMOUS)
@Requires(property = "micronaut.router.static-resources.default.enabled", value = "true")
class SpaController {

    @Error(status = io.micronaut.http.HttpStatus.NOT_FOUND, global = true)
    @Produces(io.micronaut.http.MediaType.TEXT_HTML)
    fun notFound(request: HttpRequest<*>): HttpResponse<*> {
        if (request.headers.accept()?.any { it.name == "text/html" } == true) {
            val resource = javaClass.classLoader.getResource("ui/index.html")
            if (resource != null) {
                return HttpResponse.ok(StreamedFile(resource))
            }
        }
        return HttpResponse.notFound(JsonError("Not Found"))
    }
}
