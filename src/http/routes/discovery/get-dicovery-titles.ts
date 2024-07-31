import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { auth } from '@/http/middlewares/auth'

import { FeaturedQueries } from './utils/fetured-queries'

async function findFeaturedTitlesByCategories() {
  const categories = await FeaturedQueries.findFeaturedCategories()
  const titles = await Promise.all(
    categories.map((cat) =>
      FeaturedQueries.findFeaturedTitlesByCategory(cat.id),
    ),
  )

  return categories.map((cat, index) => {
    return {
      ...cat,
      titles: titles[index],
    }
  })
}

export async function getDiscoveryTitles(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/discovery',
      {
        schema: {},
      },
      async (req, reply) => {
        const featuredTitles = await FeaturedQueries.findFeaturedTitles()
        const featuredTitle = await FeaturedQueries.findFeaturedTitle()
        const featuredCatagories = await findFeaturedTitlesByCategories()

        return reply.status(200).send({
          featuredTitle,
          featuredTitles,
          featuredCatagories,
        })
      },
    )
}
