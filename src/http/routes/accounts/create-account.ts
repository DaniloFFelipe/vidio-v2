import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequest } from '@/http/errors'
import { prisma } from '@/lib/prisma'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/accounts',
    {
      schema: {
        body: z.object({
          email: z.string(),
          name: z.string(),
        }),
        response: {
          201: z.object({
            accountId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { email, name } = req.body
      const accountExists = await prisma.account.findUnique({
        where: {
          email,
        },
      })
      if (accountExists) {
        throw new BadRequest('Email already taken')
      }

      const account = await prisma.account.create({
        data: {
          email,
          name,
        },
      })

      return reply.status(201).send({ accountId: account.id })
    },
  )
}
