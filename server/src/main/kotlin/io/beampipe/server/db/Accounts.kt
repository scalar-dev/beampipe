package io.beampipe.server.db

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.`java-time`.timestamp

object Accounts : UUIDTable("account") {
    val name = text("name").nullable()
    val email = text("email").nullable()

    val githubUserId = text("github_user_id").nullable()
    val subscription = text("subscription")
    val stripeId = text("stripe_id").nullable()
    val slackTeamId = text("slack_team_id").nullable()
    val slackToken = text("slack_token").nullable()

    val password = text("password").nullable()
    val salt = text("salt").nullable()

    val emailOk = bool("email_ok")
    val createdAt = timestamp("created_at")
    val timeZone = text("timezone")
    val lastLoginAt = timestamp("last_login_at")
}
