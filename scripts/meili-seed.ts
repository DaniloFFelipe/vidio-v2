import { PrismaClient } from '@prisma/client'
import MeiliSearch from 'meilisearch'

import { env } from '@/lib/env'

const prisma = new PrismaClient()

;(async function () {
  const titles = await prisma.title.findMany({
    select: {
      id: true,
      title: true,
      summary: true,
      poster: true,
      banner: true,
      released_at: true,
      type: true,
      categories: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      producer: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  })

  const meili = new MeiliSearch({
    host: env.MELISEARCH_HOST,
    apiKey: env.MELISEARCH_KEY,
  })

  meili.index('titles').deleteAllDocuments()
  meili.index('titles').addDocuments(
    titles.map((title) => ({
      ...title,
      categories: title.categories.map((c) => c.category),
    })),
    { primaryKey: 'id' },
  )
})()
