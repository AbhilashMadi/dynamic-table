import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MONGODB_URL: z.url(),
    DB_NAME: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_BASE_URL: z.url(),
  },
  runtimeEnv: {
    MONGODB_URL: process.env.MONGODB_URL,
    DB_NAME: process.env.DB_NAME,
    NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
  },
});
