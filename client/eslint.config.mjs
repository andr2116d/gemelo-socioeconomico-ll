import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Usamos el patrón canónico de "resetear estado (cargando/error) antes
      // de disparar un fetch al cambiar una dependencia". Es intencional y
      // correcto para sincronizar la UI con la carga de datos del backend, así
      // que desactivamos esta regla que lo marca como falso positivo.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
