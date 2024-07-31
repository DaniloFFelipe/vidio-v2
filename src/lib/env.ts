import 'dotenv/config'

import z from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  SERVER_PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string(),

  REDIS_HOST: z.string(),

  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number(),

  MELISEARCH_KEY: z.string(),
  MELISEARCH_HOST: z.string().url(),
})

export const env = schema.parse(process.env)
