package io.beampipe.server

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class Config(
    val PGHOST: String = "localhost",
    val PGPORT: Int = 5432,
    val PGDATABASE: String = "postgres",
    val PGUSER: String = "postgres",
    val PGPASSWORD: String = "postgres",

    val JWT_KEY: String,
    val GITHUB_CLIENT_ID: String?,
    val GITHUB_CLIENT_SECRET: String?,
    val STRIPE_API_KEY: String?,
    val GEOLITE2_DB_PATH: String?
)