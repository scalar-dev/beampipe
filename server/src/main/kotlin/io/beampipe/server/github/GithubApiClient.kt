package io.beampipe.server.github

import io.vertx.core.Vertx
import io.vertx.ext.web.client.WebClient
import io.vertx.kotlin.coroutines.await

class GithubApiClient(private val vertx: Vertx) {
    data class GithubUser(val id: Long, val name: String?, val email: String?)
    data class GithubUserEmail(val email: String, val primary: Boolean)

    private val client = WebClient.create(vertx)

    suspend fun getUser(
        authorization: String?
    ): GithubUser? {
      val response = client
          .get("/user")
          .putHeader("Authorization", authorization)
          .putHeader("User-Agent", "https://www.beampipe.io")
          .putHeader("Accept", "application/vnd.github.v3+json, application/json")
          .send()
          .await()

        return response.bodyAsJsonObject().mapTo(GithubUser::class.java)
    }


}