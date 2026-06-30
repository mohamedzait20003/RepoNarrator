export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY ?? '',
    adminEmailDomain: process.env.ADMIN_EMAIL_DOMAIN ?? 'reponarratoradmin.com',
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:4000/auth/github/callback',
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  },

  llm: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  },
});
