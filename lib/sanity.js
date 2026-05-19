import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '88ym68hf';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
});

const builder = imageUrlBuilder(client);
export function urlFor(source) {
  try {
    if (!source || !source.asset || !source.asset._ref) return null;
    return builder.image(source).url();
  } catch (e) {
    return null;
  }
}

export async function getPosts() {
  try {
    return await client.fetch(`
      {
        "posts": *[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          excerpt,
          publishedAt,
          mainImage,
          "author": author->name,
          "authorTitle": author->title,
          "categories": categories[]->title,
          body
        },
        "categories": *[_type == "category"] {
          _id,
          title,
          "icon": icon,
          "count": count(*[_type == "post" && references(^._id)])
        },
        "glossary": *[_type == "glossary"] | order(term asc) {
          _id,
          term,
          mn,
          def
        }
      }
    `, {}, { next: { revalidate: 0 }, cache: 'no-store' });
  } catch (error) {
    console.error("Sanity fetch error in getPosts:", error);
    return null;
  }
}
