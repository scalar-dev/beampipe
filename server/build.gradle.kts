plugins {
    id("org.jetbrains.kotlin.jvm") version "1.5.0"
    id("io.vertx.vertx-plugin") version "1.2.0"
    id("com.google.cloud.tools.jib") version "3.1.2"
}

repositories {
    mavenCentral()
    jcenter()
}

version = "0.1"
group = "io.beampipe"

val exposedVersion = "0.31.1"
val junitVersion = "5.3.2"
val testContainers = "1.15.3"

dependencies {
    implementation("io.vertx:vertx-core")
    implementation("io.vertx:vertx-lang-kotlin")
    implementation("io.vertx:vertx-lang-kotlin-coroutines")
    implementation("io.vertx:vertx-web-graphql")
    implementation("io.vertx:vertx-auth-jwt")
    implementation("io.vertx:vertx-grpc")
    implementation("io.vertx:vertx-web-client")
    implementation("io.vertx:vertx-auth-oauth2")
    implementation("io.vertx:vertx-config")

    implementation("org.apache.logging.log4j:log4j-core:2.14.1")
    implementation("org.apache.logging.log4j:log4j-slf4j-impl:2.14.1")

    implementation("com.expediagroup:graphql-kotlin-schema-generator:4.1.1")

    implementation("io.vertx:vertx-jdbc-client")
    implementation("org.flywaydb:flyway-core:7.9.1")
    implementation("io.agroal:agroal-pool:1.11")
    implementation("org.postgresql:postgresql:42.2.20")
    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-java-time:$exposedVersion")

    implementation("com.fasterxml.jackson.core:jackson-databind")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    implementation("com.maxmind.geoip2:geoip2:2.14.0")
    implementation("io.whitfin:siphash:2.0.0")
    implementation("com.stripe:stripe-java:19.35.0")
    implementation("nl.basjes.parse.useragent:yauaa:5.19")

    implementation("com.slack.api:bolt:1.8.1")
    implementation("org.jetbrains.kotlin:kotlin-reflect:1.5.20")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-jdk8:1.5.1")
    implementation("commons-validator:commons-validator:1.7")
    implementation("com.snowplowanalytics:java-referer-parser:0.4.0-rc4")
    implementation("com.neovisionaries:nv-i18n:1.27")
    implementation("com.cronutils:cron-utils:9.1.5")

    testImplementation("io.vertx:vertx-junit5")
    testImplementation("io.vertx:vertx-web-client")
    testImplementation("org.junit.jupiter:junit-jupiter-api:$junitVersion")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:$junitVersion")

    testImplementation("org.testcontainers:testcontainers:$testContainers")
    testImplementation("org.testcontainers:junit-jupiter:$testContainers")
    testImplementation("org.testcontainers:postgresql:$testContainers")
}

vertx {
    mainVerticle = "io.beampipe.server.Application"
    vertxVersion = "4.1.1"
}

jib {
    from {
        image = "gcr.io/distroless/java:11"
    }

    to {
        image = "beampipe-server"
    }

    container {
        mainClass = "io.vertx.core.Launcher"
        args = listOf("run", "io.beampipe.server.Application")
    }

    extraDirectories {
        paths {
            path {
                setFrom(file("../geolite2/"))
                into = "/data"
            }
        }
    }
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(11))
    }
}

tasks.test {
    useJUnitPlatform()
}
