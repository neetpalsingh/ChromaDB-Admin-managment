/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHROMADB_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_ADMIN_URL: string
  readonly VITE_PORT: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_TENANT_API_URL: string
  readonly VITE_API_KEY?: string
  readonly VITE_AUTH_ENABLED?: string
  readonly VITE_AUTH_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
