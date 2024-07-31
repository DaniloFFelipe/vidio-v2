import { type FastifyInstance, name } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BadRequest } from '@/http/errors'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function createProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/profiles',
      {
        schema: {
          body: z.object({
            avatar: z.string(),
            name: z.string(),
            kids: z.boolean().default(false),
          }),
          response: {
            201: z.object({
              profileId: z.string().uuid(),
            }),
          },
        },
      },
      async (req, reply) => {
        const accountId = await req.getCurrentUserId()
        const profilesCount = await prisma.profile.count({
          where: {
            account_id: accountId,
          },
        })

        if (profilesCount === 6) {
          throw new BadRequest('Profiles limit achieved')
        }
        const { avatar, kids, name } = req.body
        const profile = await prisma.profile.create({
          data: {
            avatar,
            is_for_kids: kids,
            name,
            account_id: accountId,
          },
        })

        return reply.send({ profileId: profile.id })
      },
    )
}
