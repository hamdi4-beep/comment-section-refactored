/// <reference types="vite/client" />

interface ImportMetaEnv {
  BASE_URL: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}