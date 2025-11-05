import globals from "globals"
import js from "@eslint/js"

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.webextensions,
        ...globals.browser,
        ...globals.node,
      }
    },

    rules: {
      "no-undef": "warn",
      "no-unused-vars": "warn",
      "no-console": "off",

      // Style & Formatting Rules
      "indent": ["error", 2],
      "quotes": ["error", "double"],
      "semi": ["error", "never"],
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "space-before-blocks": "error",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],

      "camelcase": [
        "error",
        { "properties": "never" }
      ],

      "comma-dangle": ["error", "never"],
    }
  },

  { ignores: ["eslint.config.js"] }
]
