import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BadRequest } from '@/http/errors'
import { prisma } from '@/lib/prisma'

export async function authenticateWithCode(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/auth',
    {
      schema: {
        body: z.object({
          code: z.string().length(6),
          token: z.string().uuid(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { code, token } = req.body
      const authToken = await prisma.authToken.findUnique({
        where: {
          token_code: {
            token,
            code,
          },
        },
      })
      if (!authToken) {
        throw new BadRequest('Invalid code')
      }

      const accessToken = await reply.jwtSign({ sub: authToken.account_id })
      await prisma.authToken.delete({
        where: {
          id: authToken.id,
        },
      })

      return reply.send({ token: accessToken })
    },
  )
}
