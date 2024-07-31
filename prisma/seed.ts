import { faker } from '@faker-js/faker'
import { Prisma, PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import MeiliSearch from 'meilisearch'

import { env } from '@/lib/env'

import { Avatars, CategoriesData, MoviesData, SeriesData } from './data'

const prisma = new PrismaClient()
const meili = new MeiliSearch({
  host: env.MELISEARCH_HOST,
  apiKey: env.MELISEARCH_KEY,
})

async function main() {
  await prisma.watchList.deleteMany()
  await prisma.userHistory.deleteMany()
  await prisma.content.deleteMany()
  await prisma.title.deleteMany()
  await prisma.producer.deleteMany()
  await prisma.category.deleteMany()
  await prisma.profileAvatar.deleteMany()
  await meili.createIndex('titles')
  await meili.index('titles').deleteAllDocuments()

  await prisma.profileAvatar.createMany({
    data: Avatars.map((path) => {
      return {
        path,
      }
    }),
  })
  await prisma.producer.createMany({
    data: [
      {
        name: 'MARVEL',
        picture:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marvel_Logo.svg/500px-Marvel_Logo.svg.png',
        summary: 'MARVEL',
      },
      {
        name: 'Lucasfilm',
        picture:
          'https://w7.pngwing.com/pngs/30/16/png-transparent-lucasfilm-star-wars-jedi-wookieepedia-star-wars-text-logo-monochrome.png',
        summary: 'Lucasfilm',
      },
      {
        name: 'Pixar',
        picture:
          'https://w7.pngwing.com/pngs/104/702/png-transparent-pixar-black-logo-thumbnail.png',
        summary: 'Pixar',
      },
      {
        name: 'Disney',
        picture:
          'https://w7.pngwing.com/pngs/319/931/png-transparent-logo-the-walt-disney-company-brand-symbol-logo-disney-text-logo-monochrome.png',
        summary: 'Disney',
      },
    ],
  })

  const producers = await prisma.producer.findMany()

  const categories = await Promise.all(
    CategoriesData.map((name) => {
      return prisma.category.create({
        data: {
          name,
        },
      })
    }),
  )

  const titlesData: Prisma.TitleUncheckedCreateInput[] = MoviesData.map(
    (d) => ({
      id: randomUUID(),
      banner: d.thumbnail,
      poster: d.thumbnail,
      producer_id: faker.helpers.arrayElement(producers).id,
      summary: d.extract,
      title: d.title,
      type: 'MOVIE',
      released_at: faker.date.anytime(),
      contents: {
        create: {
          stream: '/assets/9c3aaf87-96a4-43bc-981c-c200b4919d08/stream',
          name: d.title,
          summary: d.extract,
          thumbnail: d.thumbnail,
          type: 'MOVIE',
        },
      },
      categories: {
        createMany: {
          data: d.genres.map((g) => {
            const id = categories.find((c) => c.name === g)!.id
            return {
              category_id: id,
            }
          }),
        },
      },
    }),
  )
  const seriesData: Prisma.TitleUncheckedCreateInput[] = SeriesData.map(
    (d) => ({
      id: randomUUID(),
      banner: d.thumbnail,
      poster: d.thumbnail,
      producer_id: faker.helpers.arrayElement(producers).id,
      summary: d.extract,
      title: d.title,
      type: 'TV',
      released_at: faker.date.anytime(),
      contents: {
        createMany: {
          data: Array.from({
            length: faker.helpers.rangeToNumber({ min: 1, max: 12 }),
          }).map((_, index) => ({
            stream: '/assets/9c3aaf87-96a4-43bc-981c-c200b4919d08/stream',
            name: 'Episode ' + index,
            summary: d.extract,
            thumbnail: d.thumbnail,
            type: 'EPISODE',
          })),
        },
      },
      categories: {
        createMany: {
          data: d.genres.map((g) => {
            const id = categories.find((c) => c.name === g)!.id
            return {
              category_id: id,
            }
          }),
        },
      },
    }),
  )

  const titles = await Promise.all(
    titlesData.concat(seriesData).map((data) =>
      prisma.title.create({
        data,
        include: {
          producer: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ),
  )

  const searchT = titles.map((t) => {
    return {
      title: t.title,
      banner: t.banner,
      poster: t.poster,
      summary: t.summary,
      type: t.type,
      released_at: t.released_at.toISOString(),
      producer: t.producer,
      categories: t.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
      })),
    }
  })
  await meili.index('titles').addDocuments(searchT, { primaryKey: 'id' })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
