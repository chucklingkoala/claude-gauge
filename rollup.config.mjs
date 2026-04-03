import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/plugin.ts",
  output: {
    file: "com.claudegauge.usage.sdPlugin/bin/plugin.js",
    format: "es",
    sourcemap: true,
  },
  external: [
    "node:fs",
    "node:fs/promises",
    "node:os",
    "node:path",
    "node:crypto",
    "node:events",
    "node:http",
    "node:https",
    "node:net",
    "node:stream",
    "node:tls",
    "node:url",
    "node:util",
    "node:zlib",
    "node:buffer",
    "fs",
    "fs/promises",
    "os",
    "path",
    "crypto",
    "events",
    "http",
    "https",
    "net",
    "stream",
    "tls",
    "url",
    "util",
    "zlib",
    "buffer",
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
    }),
    commonjs(),
    nodeResolve({
      browser: false,
      exportConditions: ["node"],
      preferBuiltins: true,
    }),
  ],
};
