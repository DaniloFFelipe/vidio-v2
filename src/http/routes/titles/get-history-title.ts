import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getHistoryTitles(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/titles/history',
      {
        schema: {},
      },
      async (req, reply) => {
        const profileId = req.getProfileId()
        const titles = await prisma.title.findMany({
          where: {
            onHistory: {
              some: {
                profile_id: profileId,
              },
            },
          },
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
            onWatchList: {
              where: {
                profile_id: profileId,
              },
            },
            producer: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
            contents: true,
          },
        })

        return reply.send({
          titles: titles.map((title) => ({
            ...title,
            onWatchList: title.onWatchList.length > 0,
            categories: title.categories.map((c) => c.category),
          })),
        })
      },
    )
}
