# Stage 1: Build the React UI
FROM oven/bun:latest AS ui-build
WORKDIR /app
RUN echo '{"private":true,"workspaces":["packages/*","ui"]}' > package.json
COPY packages/tracker/ packages/tracker/
COPY packages/components/ packages/components/
COPY ui/package.json ui/
RUN bun install
COPY ui/ ui/
RUN rm -f ui/.env.development
ENV CI=true
WORKDIR /app/ui
RUN bun run build

# Stage 2: Build the server Shadow JAR
FROM gradle:8.10-jdk17 AS server-build
WORKDIR /app
COPY server/ server/
# Use a single-project settings.gradle to avoid needing the ui subproject
RUN echo 'include "server"' > settings.gradle
COPY build.gradle ./
# Copy pre-built UI into resources so it's included in the JAR on the classpath
COPY --from=ui-build /app/ui/dist server/src/main/resources/ui/
ENV GRADLE_OPTS="-Xmx512m -Dorg.gradle.jvmargs=-Xmx512m"
RUN gradle --no-daemon --console=plain server:shadowJar

# Stage 3: Download DB-IP City Lite database
FROM alpine:3.18 AS geoip
RUN apk add --no-cache wget && \
    YEAR=$(date +%Y) && \
    MONTH=$(($(date +%-m) - 1)) && \
    if [ "$MONTH" -eq 0 ]; then MONTH=12; YEAR=$((YEAR - 1)); fi && \
    YEAR_MONTH=$(printf "%d-%02d" "$YEAR" "$MONTH") && \
    mkdir -p /data && \
    wget -q -O /tmp/dbip.mmdb.gz "https://download.db-ip.com/free/dbip-city-lite-${YEAR_MONTH}.mmdb.gz" && \
    gunzip /tmp/dbip.mmdb.gz && \
    mv /tmp/dbip.mmdb /data/dbip-city-lite.mmdb

# Stage 4: Runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=server-build /app/server/build/libs/server-*-all.jar /app/server.jar
COPY --from=geoip /data/ /data/
ENV GEOIP_DB=/data/dbip-city-lite.mmdb
EXPOSE 8080
CMD ["java", "-Xmx256m", "-jar", "/app/server.jar"]
