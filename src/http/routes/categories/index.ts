import type { FastifyInstance } from 'fastify'

import { getCategories } from './get-categories'

export async function categoriesRoutes(app: FastifyInstance) {
  app.register(getCategories)
}
