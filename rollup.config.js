import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import cleanup from "rollup-plugin-cleanup";

export default {
  input: "./index.ts",
  output: [
    {
      format: "es",
      entryFileNames: "es.js",
      preserveModules: false,
      sourcemap: false,
      exports: "named",
      dir: "out",
    },
    {
      format: "cjs",
      entryFileNames: "cjs.js",
      preserveModules: false,
      sourcemap: false,
      exports: "named",
      dir: "out",
    },
  ],
  // 配置需要排除的包
  external: (id) => /^(node:)|(tslib)|(@lmssee)/.test(id),
  plugins: [
    resolve(),
    commonjs(),
    // 打包压缩，自动去注释
    terser(),
    // 可打包 json 内容
    json(),
    typescript({}),
    // 去除无用代码
    cleanup(),
  ],
};
