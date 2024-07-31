import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { BadRequest } from '@/http/errors'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function deleteProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/profiles/:profileId',
      {
        schema: {
          params: z.object({
            profileId: z.string().uuid(),
          }),
        },
      },
      async (req, reply) => {
        const accountId = await req.getCurrentUserId()
        const { profileId } = await req.params
        const profile = await prisma.profile.findFirst({
          where: {
            account_id: accountId,
            id: profileId,
          },
        })

        if (!profile) {
          throw new BadRequest('Profile not found')
        }

        await prisma.profile.delete({
          where: {
            id: profile.id,
          },
        })

        return reply.status(204).send()
      },
    )
}
