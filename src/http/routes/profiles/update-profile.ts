import { type FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BadRequest } from '@/http/errors'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function updateProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/profiles/:profileId',
      {
        schema: {
          params: z.object({
            profileId: z.string().uuid(),
          }),
          body: z.object({
            avatar: z.string().optional(),
            name: z.string().optional(),
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
        const { profileId } = req.params
        const profile = await prisma.profile.findFirst({
          where: {
            account_id: accountId,
            id: profileId,
          },
        })

        if (!profile) {
          throw new BadRequest('Profile not found')
        }

        const { avatar, name } = req.body
        await prisma.profile.update({
          where: {
            id: profile.id,
          },
          data: {
            avatar,
            name,
          },
        })

        return reply.send({ profileId: profile.id })
      },
    )
}
