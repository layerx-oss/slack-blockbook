import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    shims: true,
    sourcemap: true,
    target: "node18",
  },
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    dts: true,
    shims: true,
    sourcemap: true,
    target: "node18",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
