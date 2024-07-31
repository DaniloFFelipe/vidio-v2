import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getProfiles(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/profiles',
      {
        schema: {
          response: {
            200: z.object({
              profiles: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  avatar: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const accountId = await req.getCurrentUserId()
        const profiles = await prisma.profile.findMany({
          where: {
            account_id: accountId,
          },
          select: {
            avatar: true,
            id: true,
            name: true,
          },
        })

        return reply.status(200).send({
          profiles,
        })
      },
    )
}
