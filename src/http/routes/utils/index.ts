import type { FastifyInstance } from 'fastify'

import { getAvatars } from './get-avatars'

export async function utilsRoutes(app: FastifyInstance) {
  app.register(getAvatars)
}
