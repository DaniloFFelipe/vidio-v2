import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BadRequest } from '@/http/errors'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getTitle(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/titles/:titleId',
      {
        schema: {
          params: z.object({
            titleId: z.string().uuid(),
          }),
        },
      },
      async (req, reply) => {
        const profileId = req.getProfileId()
        const { titleId } = req.params
        const title = await prisma.title.findUnique({
          where: {
            id: titleId,
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
            producer: {
              select: {
                id: true,
                name: true,
                picture: true,
              },
            },
            onWatchList: {
              where: {
                profile_id: profileId,
              },
            },
            contents: true,
          },
        })

        if (!title) {
          throw new BadRequest('Title not found')
        }

        return reply.send({
          ...title,
          onWatchList: title.onWatchList.length > 0,
          categories: title.categories.map((c) => c.category),
        })
      },
    )
}
