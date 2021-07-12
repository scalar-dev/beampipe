plugins {
    id("org.jetbrains.kotlin.jvm") version "1.5.0"
    id("io.vertx.vertx-plugin") version "1.2.0"
    id("com.google.cloud.tools.jib") version "2.7.1"
}

repositories {
    mavenCentral()
    jcenter()
}

version = "0.1"
group = "io.beampipe"

val exposedVersion = "0.31.1"

dependencies {
    implementation("io.vertx:vertx-core")
    implementation("io.vertx:vertx-lang-kotlin")
    implementation("io.vertx:vertx-lang-kotlin-coroutines")
    implementation("io.vertx:vertx-web-graphql")
    implementation("io.vertx:vertx-auth-jwt")
    implementation("io.vertx:vertx-grpc")

    implementation("org.apache.logging.log4j:log4j-core:2.14.1")
    implementation("org.apache.logging.log4j:log4j-slf4j-impl:2.14.1")

    implementation("com.expediagroup:graphql-kotlin-schema-generator:4.1.1")

    implementation("io.vertx:vertx-jdbc-client:4.0.3")
    implementation("org.flywaydb:flyway-core:7.9.1")
    implementation("io.agroal:agroal-pool:1.11")
    implementation("org.postgresql:postgresql:42.2.20")
    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-java-time:$exposedVersion")

    implementation("com.fasterxml.jackson.core:jackson-databind:2.12.3")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.12.3")

//    runtimeOnly("ch.qos.logback:logback-classic")
//    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
//
//    implementation 'io.micronaut.flyway:micronaut-flyway'
//    runtimeOnly 'io.micronaut.sql:micronaut-jdbc-hikari'
//    implementation group: 'org.postgresql', name: 'postgresql', version: '42.2.14'
//
//    implementation "org.jetbrains.exposed:exposed-core:$exposedVersion"
//    implementation "org.jetbrains.exposed:exposed-dao:$exposedVersion"
//    implementation "org.jetbrains.exposed:exposed-jdbc:$exposedVersion"
//    implementation "org.jetbrains.exposed:exposed-java-time:$exposedVersion"
//
//    implementation 'io.micronaut.graphql:micronaut-graphql'
//    implementation 'com.expediagroup:graphql-kotlin-schema-generator:3.4.1'
//
    implementation("com.maxmind.geoip2:geoip2:2.14.0")
    implementation("io.whitfin:siphash:2.0.0")
    implementation("com.stripe:stripe-java:19.35.0")
//
    implementation("nl.basjes.parse.useragent:yauaa:5.19")
//

    implementation("io.vertx:vertx-web-client:4.1.1")
    implementation("io.vertx:vertx-auth-oauth2:4.1.1")

    implementation("com.slack.api:bolt:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-jdk8:1.3.8")
//
    implementation("commons-validator:commons-validator:1.7")
    implementation("com.snowplowanalytics:java-referer-parser:0.4.0-rc4")
    implementation("com.neovisionaries:nv-i18n:1.27")

//
//    kaptTest(platform("io.micronaut:micronaut-bom:$micronautVersion"))
//    kaptTest("io.micronaut:micronaut-inject-java")
//    testImplementation(platform("io.micronaut:micronaut-bom:$micronautVersion"))
//    testImplementation("org.junit.jupiter:junit-jupiter-api")
//    testImplementation("io.micronaut.test:micronaut-test-junit5")
//    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
//
//    testImplementation "org.mockito:mockito-junit-jupiter:2.22.0"
//
//    testImplementation "org.testcontainers:testcontainers:1.12.3"
//    testImplementation "org.testcontainers:postgresql:1.12.3"
//    testImplementation "org.testcontainers:junit-jupiter:1.12.3"
}

//mainClassName = "io.beampipe.server.ApplicationKt"

vertx {
    mainVerticle = "io.beampipe.server.Application"
    vertxVersion = "4.0.3"
}

jib {
    from {
        image = "gcr.io/distroless/java:11"
    }

//    extraDirectories {
//        paths {
//            path {
//                from = file("../geolite2/")
//                into = "/data"
//            }
//        }
//    }
}



