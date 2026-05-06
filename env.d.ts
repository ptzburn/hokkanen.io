interface ImportMetaEnv {
  readonly VITE_HOST_URL: string;
  readonly VITE_TURNSTILE_SITE_KEY: string;
  readonly VITE_TURNSTILE_SECRET_KEY: string;
  readonly VITE_S3_PUBLIC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
