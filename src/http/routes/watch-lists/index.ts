import type { FastifyInstance } from 'fastify'

import { touchOnWatchList } from './touch-on-watch-list'

export async function watchListRoutes(app: FastifyInstance) {
  app.register(touchOnWatchList)
}
