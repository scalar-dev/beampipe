# Beampipe

Beampipe is a simple, open source web analytics tool built on TimescaleDB.  Try it out at: https://beampipe.io/. We are currently working on updating this README and making beampipe easy to self-host.

![screenhot](web/public/images/screenshot.png)

Beampipe is built and sponsored by [Scalar](https://www.scalar.dev).

## Architecture
Beampipe is designed to be simple and easy to deploy anywhere. The backend is
written in Kotlin using Micronaut and depends only on a PostgreSQL database with
the TimescaleDB extension installed.

The frontend is built with TypeScript, React, Tailwind and graphql.

Both components can be deployed via kubernetes (configuration coming soon!).

<br>
<br>

## Website

Start developing

```sh
cd web
yarn
yarn dev
```

Run locally at http://localhost:3000
<br>

## Docs

Docs website: https://docs.beampipe.io/

Start developing

```sh
cd docs
yarn
gatsby develop
```

Run locally at
http://localhost:8000
