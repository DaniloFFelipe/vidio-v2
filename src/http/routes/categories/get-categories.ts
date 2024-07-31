import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function getCategories(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/categories',
      {
        schema: {
          response: {
            200: z.object({
              categories: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const categories = await prisma.category.findMany({
          select: {
            id: true,
            name: true,
          },
        })

        return reply.status(200).send({
          categories,
        })
      },
    )
}
