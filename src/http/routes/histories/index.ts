import type { FastifyInstance } from 'fastify'

import { touchOnHistory } from './touch-on-history'

export async function historyRoutes(app: FastifyInstance) {
  app.register(touchOnHistory)
}
