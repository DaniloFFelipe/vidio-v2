import type { FastifyInstance } from 'fastify'

import { accountsRoutes } from './accounts'
import { categoriesRoutes } from './categories'
import { discoveryRoutes } from './discovery'
import { historyRoutes } from './histories'
import { producerRoutes } from './producer'
import { profileRoutes } from './profiles'
import { titlesRoutes } from './titles'
import { utilsRoutes } from './utils'
import { watchListRoutes } from './watch-lists'

export async function routes(app: FastifyInstance) {
  app.register(accountsRoutes)
  app.register(categoriesRoutes)
  app.register(discoveryRoutes)
  app.register(historyRoutes)
  app.register(producerRoutes)
  app.register(profileRoutes)
  app.register(titlesRoutes)
  app.register(utilsRoutes)
  app.register(watchListRoutes)
}
