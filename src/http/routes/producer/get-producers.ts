import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getProducers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/producers',
      {
        schema: {
          response: {
            200: z.object({
              producers: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  summary: z.string(),
                  picture: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const producers = await prisma.producer.findMany({
          select: {
            id: true,
            name: true,
            summary: true,
            picture: true,
          },
        })

        return reply.status(200).send({
          producers,
        })
      },
    )
}
