import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    {
        files: ["src/**/*.js", "test/**/*.js"], // Only lint JavaScript files in `src/`
        languageOptions: {
            sourceType: "commonjs", // Use CommonJS
            globals: globals.node,  // Node.js global variables
        },
        rules: {
            ...pluginJs.configs.recommended.rules, // Include recommended rules
            quotes: ["error", "single"],          // Enforce single quotes
            "no-var": "error",          // Disallow the use of `var`
            "prefer-const": "error",    // Enforce `const` when variables are never reassigned
            "no-unused-vars": "warn",   // Warn for unused variables (optional)
            strict: ["error", "global"], // Enforce 'use strict' at the global scope
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
        },
    },
];
