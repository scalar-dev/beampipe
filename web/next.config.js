/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Skip type checking during build — hoisted monorepo types cause false
  // positives (duplicate @types/react, fontawesome-common-types, etc.).
  typescript: {
    ignoreBuildErrors: true,
  },
}
