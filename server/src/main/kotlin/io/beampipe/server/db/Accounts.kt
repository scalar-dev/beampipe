package io.beampipe.server.db

import org.jetbrains.exposed.dao.id.UUIDTable

object Accounts : UUIDTable("account") {
    val githubUserId = text("github_user_id")
    val name = text("name")
    val email = text("email")
    val subscription = text("subscription")
    val stripeId = text("stripe_id").nullable()
    val slackTeamId = text("slack_team_id")
    val slackToken = text("slack_token")

    val password = text("password")
    val salt = text("salt")

    val emailOk = bool("email_ok")
}
