// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import eslintConfigPrettier from "eslint-config-prettier";

export default withNuxt([
    eslintConfigPrettier,
    {
        // Note: there should be no other properties in this object
        ignores: ["node_modules/**/*", ".output/**/*", ".nuxt/**/*", "dist/**/*"],
    },
]);
