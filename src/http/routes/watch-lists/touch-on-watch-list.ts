import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function touchOnWatchList(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/watch-list/:titleId/touch',
      {
        schema: {
          params: z.object({
            titleId: z.string().uuid(),
          }),
          response: {},
        },
      },
      async (req, reply) => {
        const { titleId } = req.params
        const profileId = req.getProfileId()
        const watchList = await prisma.watchList.findUnique({
          where: {
            profile_id_title_id: {
              profile_id: profileId,
              title_id: titleId,
            },
          },
        })

        if (watchList) {
          await prisma.watchList.delete({
            where: { id: watchList.id },
          })
          return
        }

        await prisma.watchList.create({
          data: {
            profile_id: profileId,
            title_id: titleId,
          },
        })

        return reply.status(204).send()
      },
    )
}
