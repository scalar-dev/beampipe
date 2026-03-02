# Stage 1: Build the React UI
FROM node:16-alpine AS ui-build
WORKDIR /app/ui
COPY ui/package.json ui/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ui/ .
ENV CI=true
RUN yarn build

# Stage 2: Build the server Shadow JAR
FROM gradle:7.6-jdk11 AS server-build
WORKDIR /app
COPY server/ server/
# Use a single-project settings.gradle to avoid needing the ui subproject
RUN echo 'include "server"' > settings.gradle
COPY build.gradle ./
# Copy pre-built UI into resources so it's included in the JAR on the classpath
COPY --from=ui-build /app/ui/build server/src/main/resources/ui/
ENV GRADLE_OPTS="-Xmx512m -Dorg.gradle.jvmargs=-Xmx512m"
RUN gradle --no-daemon --console=plain server:shadowJar

# Stage 3: Conditionally download GeoLite2 database
FROM alpine:3.18 AS geolite2
ARG GEOLITE2_LICENSE_KEY
RUN if [ -n "$GEOLITE2_LICENSE_KEY" ]; then \
      apk add --no-cache wget && \
      wget -q -O /tmp/geolite2.tar.gz "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${GEOLITE2_LICENSE_KEY}&suffix=tar.gz" && \
      mkdir -p /data && \
      tar xf /tmp/geolite2.tar.gz -C /tmp && \
      mv /tmp/GeoLite2-City_*/GeoLite2-City.mmdb /data/GeoLite2-City.mmdb && \
      rm -rf /tmp/geolite2.tar.gz /tmp/GeoLite2-City_*; \
    else \
      mkdir -p /data; \
    fi

# Stage 4: Runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=server-build /app/server/build/libs/server-*-all.jar /app/server.jar
COPY --from=geolite2 /data/ /data/
EXPOSE 8080
CMD ["java", "-Xmx256m", "-jar", "/app/server.jar"]
