import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    MONGODB_URL: z.url(),
    DB_NAME: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    MONGODB_URL: process.env.MONGODB_URL,
    DB_NAME: process.env.DB_NAME,
  },
});
