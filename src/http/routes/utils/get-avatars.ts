import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getAvatars(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/utils/avatars',
      {
        schema: {
          response: {
            200: z.object({
              avatars: z.array(
                z.object({
                  id: z.string().uuid(),
                  path: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const avatars = await prisma.profileAvatar.findMany({
          select: {
            id: true,
            path: true,
          },
        })

        return reply.status(200).send({
          avatars,
        })
      },
    )
}
