import type { FastifyInstance } from 'fastify'

import { getProducers } from './get-producers'

export async function producerRoutes(app: FastifyInstance) {
  app.register(getProducers)
}
