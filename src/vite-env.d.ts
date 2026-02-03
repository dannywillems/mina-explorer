/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_DEFAULT_NETWORK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
