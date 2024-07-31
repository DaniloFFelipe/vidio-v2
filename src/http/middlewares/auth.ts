import 'fastify'

import { Account } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

import { prisma } from '@/lib/prisma'

import { Unauthorized } from '../errors'
import { Forbidden } from '../errors/fobidden'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUser(): Promise<Account>
    getProfileId(): string
  }
}

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify<{ sub: string }>()

    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()
        return sub
      } catch {
        throw new Unauthorized('Invalid token')
      }
    }

    request.getUser = async () => {
      const userId = await request.getCurrentUserId()
      try {
        const user = await prisma.account.findUniqueOrThrow({
          where: {
            id: userId,
          },
        })

        return user
      } catch {
        throw new Unauthorized('Invalid token')
      }
    }

    request.getProfileId = () => {
      const profileId = request.headers['x-active-profile'] as string
      if (!profileId) {
        throw new Forbidden('Invalid profile')
      }

      return profileId
    }
  })
})
