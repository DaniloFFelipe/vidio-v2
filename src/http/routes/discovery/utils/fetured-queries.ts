import { Category, Title } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export const FeaturedQueries = {
  findFeaturedTitles(): Promise<Title[]> {
    return prisma.$queryRaw<Title[]>`
      select 
      t.*,
      (
            SELECT jsonb_agg(d)
            FROM (
                select c.*
                from categories c
                left join title_category tc on tc.category_id = c.id
                where tc.title_id = t.id
          ) d
        ) as categories,
        (
            SELECT jsonb_agg(d)
            FROM (
                select p.id, p.name, p.picture
                from producer p
                where p.id = t.producer_id
          ) d
        ) as producer
    from titles t
    order by (
      select count(uh.id)
      from user_histories uh
      where uh.title_id = t.id 
      and (CURRENT_DATE::DATE - uh.watched_at::DATE) <= 30
    ) desc
    limit 10
    `
  },

  async findFeaturedTitle(): Promise<Title> {
    const [title] = await prisma.$queryRaw<Title[]>`
        select 
        t.*,
        (
            SELECT jsonb_agg(d)
            FROM (
                select c.*
                from categories c
                left join title_category tc on tc.category_id = c.id
                where tc.title_id = t.id
          ) d
        ) as categories,
        (
            SELECT jsonb_agg(d)
            FROM (
                select p.id, p.name, p.picture
                from producer p
                where p.id = t.producer_id
          ) d
        ) as producer
      from titles t
      order by (
        select count(uh.id)
        from user_histories uh
        where uh.title_id = t.id 
        and (CURRENT_DATE::DATE - uh.watched_at::DATE) <= 7 
      ) desc
      limit 1
    `
    return title
  },

  findFeaturedCategories(): Promise<Category[]> {
    return prisma.$queryRaw<Category[]>`
        select distinct dt.*
        from (
          select 
            c.id,
            c.name
          from titles t
          left join title_category tc on tc.title_id = t.id
          left join categories c on tc.category_id = c.id
          order by (
            select count(uh.id)
            from user_histories uh
            where uh.title_id = t.id 
            and (CURRENT_DATE::DATE - uh.watched_at::DATE) <= 30
          ) desc
        ) dt
        limit 10
      `
  },

  findFeaturedTitlesByCategory(categoryId: string): Promise<Title[]> {
    return prisma.$queryRaw<Title[]>`
      select 
      t.*,
      (
            SELECT jsonb_agg(d)
            FROM (
                select c.*
                from categories c
                left join title_category tc2 on tc2.category_id = c.id
                where tc2.title_id = t.id
          ) d
        ) as categories,
        (
            SELECT jsonb_agg(d)
            FROM (
                select p.id, p.name, p.picture
                from producer p
                where p.id = t.producer_id
          ) d
        ) as producer
    from titles t
    where t.id in (
      select tc.title_id
      from title_category tc
      where tc.category_id = ${categoryId}
    )
    order by (
      select count(uh.id)
      from user_histories uh
      where uh.title_id = t.id 
      and (CURRENT_DATE::DATE - uh.watched_at::DATE) <= 7 
    ) desc
    limit 10
    `
  },
}
