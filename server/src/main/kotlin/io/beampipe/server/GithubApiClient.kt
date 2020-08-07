package io.beampipe.server

import io.micronaut.http.HttpHeaders
import io.micronaut.http.annotation.Get
import io.micronaut.http.annotation.Header
import io.micronaut.http.annotation.Headers
import io.micronaut.http.client.annotation.Client
import io.reactivex.Flowable

@Headers(
        Header(name = "User-Agent", value = "https://micronautguides.com"),
        Header(name = "Accept", value = "application/vnd.github.v3+json, application/json")
)
@Client(id = "githubv3")
interface GithubApiClient {
    data class GithubUser(val id: Long, val name: String, val email: String?)
    data class GithubUserEmail(val email: String, val primary: Boolean)

    @Get("/user")
    fun getUser(
            @Header(HttpHeaders.AUTHORIZATION) authorization: String?): Flowable<GithubUser?>?

    @Get("/user/emails")
    fun getUserEmails(
            @Header(HttpHeaders.AUTHORIZATION) authorization: String?): Flowable<List<GithubUserEmail>>?
}