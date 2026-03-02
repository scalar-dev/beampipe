const result = await Bun.build({
  entrypoints: ["./src/tracker.ts"],
  outdir: "./dist",
  format: "iife",
  minify: true,
  target: "browser",
  naming: "[name].js",
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("Built tracker.js successfully");
