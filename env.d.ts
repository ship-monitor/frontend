/// <reference types="vite/client" />

interface ImportMetaEnv {
  // TODO(env): Declare required VITE_API_URL and the configured CMS URL so missing or misspelled build variables are type-checked.
  readonly VITE_PLAUSIBLE_URL?: string;
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
