import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function main() {
  // Build worker (Node target)
  await esbuild.build({
    entryPoints: [path.join(root, "src/worker.ts")],
    outfile: path.join(root, "dist/worker.js"),
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    external: ["@paperclipai/plugin-sdk"],
    sourcemap: true,
  });

  // Build manifest (Node target)
  await esbuild.build({
    entryPoints: [path.join(root, "src/manifest.ts")],
    outfile: path.join(root, "dist/manifest.js"),
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    external: ["@paperclipai/plugin-sdk"],
    sourcemap: true,
  });

  // Build UI (browser target)
  await esbuild.build({
    entryPoints: [path.join(root, "src/ui/index.tsx")],
    outfile: path.join(root, "dist/ui/index.js"),
    bundle: true,
    platform: "browser",
    target: "es2020",
    format: "esm",
    jsx: "automatic",
    external: ["react", "react-dom", "@paperclipai/plugin-sdk"],
    sourcemap: true,
  });

  console.log("Build complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
