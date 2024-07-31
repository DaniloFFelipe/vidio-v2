import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function touchOnHistory(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/history/:titleId/touch',
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
        const history = await prisma.userHistory.findUnique({
          where: {
            profile_id_title_id: {
              profile_id: profileId,
              title_id: titleId,
            },
          },
        })

        if (history) {
          await prisma.userHistory.update({
            where: { id: history.id },
            data: { watched_at: new Date() },
          })
          return
        }

        await prisma.userHistory.create({
          data: {
            profile_id: profileId,
            title_id: titleId,
          },
        })

        return reply.status(204).send()
      },
    )
}
