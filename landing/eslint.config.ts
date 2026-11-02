import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

const nuxtGlobals = {
  defineNuxtConfig: "readonly",
  definePageMeta: "readonly",
  defineNuxtPlugin: "readonly",
  defineNuxtRouteMiddleware: "readonly",
  navigateTo: "readonly",
  useHead: "readonly",
  useSeoMeta: "readonly",
  useAsyncData: "readonly",
  useRoute: "readonly",
  useRouter: "readonly",
  useNuxtApp: "readonly",
  computed: "readonly",
  ref: "readonly",
  reactive: "readonly",
  watch: "readonly",
  onMounted: "readonly",
  onBeforeUnmount: "readonly",
};

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".nuxt/**",
      ".output/**",
      "package-lock.json",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...nuxtGlobals } },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.vue"],
    extends: [...pluginVue.configs["flat/recommended"]],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ["app/pages/**/*.vue", "app/layouts/**/*.vue", "app/app.vue"],
    rules: { "vue/multi-word-component-names": "off" },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
]);
