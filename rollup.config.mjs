import babel from "@rollup/plugin-babel";
import commonJS from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const extensions = [".mjs", ".js", ".ts", ".json"];

export default {
    input: "./src/index.ts",
    external: ["nakama-runtime"],
    plugins: [
        resolve({ extensions }),

        // Compile TypeScript
        typescript(),
        json(),
        // Resolve CommonJS modules
        commonJS({ extensions }),

        // Transpile to ES5
        babel({
            extensions,
            babelHelpers: "bundled",
        }),
    ],
    output: {
        file: "./dist/index.js",
    },
    treeshake: true,
};
