import type { FastifyInstance } from 'fastify'

import { getDiscoveryTitles } from './get-dicovery-titles'

export async function discoveryRoutes(app: FastifyInstance) {
  app.register(getDiscoveryTitles)
}
