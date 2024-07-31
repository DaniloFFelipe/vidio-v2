import { randomUUID } from 'crypto'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { mail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/utils/code-generator'

export async function requestAuthCode(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/request',
    {
      schema: {
        body: z.object({
          email: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string().uuid(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { email } = req.body
      const account = await prisma.account.findUnique({
        where: {
          email,
        },
      })
      if (!account) {
        return reply.send({ token: randomUUID() })
      }

      const currentAuthToken = await prisma.authToken.findUnique({
        where: {
          account_id: account.id,
        },
      })
      if (currentAuthToken) {
        await prisma.authToken.delete({
          where: {
            id: currentAuthToken.id,
          },
        })
      }

      const authToken = await prisma.authToken.create({
        data: {
          code: generateCode(),
          account_id: account.id,
        },
      })

      await mail.sendMail({
        from: {
          name: 'vid.io',
          address: 'hi@vid.io',
        },
        to: email,
        subject: 'Authentication code',
        text: `This is or authentication code: ${authToken.code}`,
      })

      return reply.status(201).send({ token: authToken.token })
    },
  )
}
