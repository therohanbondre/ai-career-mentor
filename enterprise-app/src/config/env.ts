export type AppEnv = {
  appName: string;
  appUrl: string;
  apiBaseUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
};

export type ServerEnv = {
  databaseUrl: string;
  authSecret: string;
  authUrl: string;
  googleGenerativeAiApiKey: string;
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env: AppEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Enterprise App',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000/api',
  nodeEnv: (process.env.NODE_ENV as AppEnv['nodeEnv']) ?? 'development',
};

export const serverEnv: ServerEnv = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  authSecret: process.env.AUTH_SECRET ?? '',
  authUrl: process.env.AUTH_URL ?? env.appUrl,
  googleGenerativeAiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
};

export function assertServerEnv(): ServerEnv {
  return {
    databaseUrl: requireEnv('DATABASE_URL', process.env.DATABASE_URL),
    authSecret: requireEnv('AUTH_SECRET', process.env.AUTH_SECRET),
    authUrl: process.env.AUTH_URL ?? env.appUrl,
    googleGenerativeAiApiKey: requireEnv(
      'GOOGLE_GENERATIVE_AI_API_KEY',
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    ),
  };
}
