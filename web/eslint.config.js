import nextPlugin from "eslint-config-next";

const config = [
  ...nextPlugin,
  {
    rules: {
      // React Compiler diagnostics — not applicable, this project doesn't use the compiler.
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/immutability": "off",
      "react-hooks/globals": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/unsupported-syntax": "off",
      "react-hooks/config": "off",
      "react-hooks/gating": "off",

      "no-unused-vars": [
        "warn",
        { args: "none", ignoreRestSiblings: true, caughtErrors: "none" },
      ],
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

export default config;
