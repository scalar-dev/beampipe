/* eslint-disable no-console */
const express = require('express')
const next = require('next')
const { createProxyMiddleware } = require('http-proxy-middleware');

const devProxy = {
  '/graphql': { target: 'http://localhost:8080' },
  '/graphiql': { target: 'http://localhost:8080' },
  '/oauth': { target: 'http://localhost:8080' },
  '/logout': { target: 'http://localhost:8080' },
  '/login': { target: 'http://localhost:8080' },
  '/stripe': { target: 'http://localhost:8080' },
}

const port = parseInt(process.env.PORT, 10) || 3000
const env = process.env.NODE_ENV
const dev = env !== 'production'
const app = next({
  dir: '.', // base directory where everything is, could move to src later
  dev,
})

const handle = app.getRequestHandler()

let server
app
  .prepare()
  .then(() => {
    server = express()

    // Set up the proxy.
    if (dev && devProxy) {
      const proxyMiddleware = require('http-proxy-middleware')
      Object.keys(devProxy).forEach(function (context) {
        server.use(createProxyMiddleware(context, devProxy[context]))
      })
    }

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res))

    server.listen(port, (err) => {
      if (err) {
        throw err
      }
      console.log(`> Ready on port ${port} [${env}]`)
    })
  })
  .catch((err) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })
