import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["out/", "dist/", "node_modules/", ".vscode-test/"]
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: { 
      globals: globals.node 
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/naming-convention": "warn",
      "curly": "warn",
      "eqeqeq": "warn",
      "no-throw-literal": "off", // Updated to @typescript-eslint/only-throw-error or similar if needed, but keeping simple first.
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }] // Common good practice
    }
  },
  {
      // Restore specific rules from .eslintrc.json
      rules: {
          "@typescript-eslint/naming-convention": "warn",
          "curly": "warn",
          "eqeqeq": "warn",
          // "no-throw-literal" is deprecated in favor of @typescript-eslint/only-throw-error or restricted syntax
          // but let's try to keep it or find the replacement.
          // eslint-plugin-import might be needed? No.
          // In ESLint 9, `no-throw-literal` is strict.
          "no-throw-literal": "warn"
      }
  }
];
