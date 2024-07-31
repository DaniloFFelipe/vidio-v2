import MeiliSearch from 'meilisearch'

import { env } from './env'

export const meilisearch = new MeiliSearch({
  host: env.MELISEARCH_HOST,
  apiKey: env.MELISEARCH_KEY,
})
