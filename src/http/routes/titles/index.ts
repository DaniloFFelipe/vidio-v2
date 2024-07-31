import type { FastifyInstance } from 'fastify'

import { getHistoryTitles } from './get-history-title'
import { getTitle } from './get-title'
import { getWatchListTitles } from './get-watch-list-title'
import { searchTitle } from './search-title'

export async function titlesRoutes(app: FastifyInstance) {
  app.register(searchTitle)
  app.register(getTitle)
  app.register(getHistoryTitles)
  app.register(getWatchListTitles)
}
