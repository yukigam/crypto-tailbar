import { MetadataRoute } from 'next'
import { client } from '../lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.cryptomn.pp.ua'

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/education`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/quests`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/demo-trade`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
  ]

  let postPages: MetadataRoute.Sitemap = []
  try {
    const data = await client.fetch<{ slug: string; publishedAt?: string; _updatedAt?: string }[]>(
      `*[_type == "post" && isUserPost != true && defined(slug.current)] | order(_createdAt desc) {
        "slug": slug.current,
        publishedAt,
        _updatedAt
      }`,
      {},
      { useCdn: true }
    )
    if (data && Array.isArray(data)) {
      postPages = data.map((p) => ({
        url: `${baseUrl}/post/${p.slug}`,
        lastModified: new Date(p.publishedAt || p._updatedAt || Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch {}

  return [...staticPages, ...postPages]
}
