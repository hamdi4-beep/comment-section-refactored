/// <reference types="vite/client" />

export {};

declare global {
  interface ImportMetaEnv {
    BASE_URL: string;
    [key: string]: any;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}