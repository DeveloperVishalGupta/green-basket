import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        FormData: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        // Node.js globals
        process: 'readonly',
        // React/Next.js
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      'no-unused-vars': "off",
    },
  },

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
    ],
  },
];
