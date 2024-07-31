import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import {
  createPaginationResponse,
  paginationSchema,
} from '@/core/types/pagination'
import { auth } from '@/http/middlewares/auth'
import { meilisearch } from '@/lib/meilisearch'

export async function searchTitle(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/titles/search',
      {
        schema: {
          querystring: paginationSchema.merge(
            z.object({
              query: z.string().optional(),
            }),
          ),
        },
      },
      async (req, reply) => {
        const { pageIndex, perPage, query } = req.query
        if (!query) {
          return reply.send(
            createPaginationResponse([], 0, { pageIndex, perPage }),
          )
        }

        const index = meilisearch.index('titles')
        const result = await index.search(query, {
          offset: pageIndex * perPage,
          limit: perPage,
        })

        return reply.send(
          createPaginationResponse(result.hits, result.estimatedTotalHits, {
            pageIndex,
            perPage,
          }),
        )
      },
    )
}
