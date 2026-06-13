import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { CATEGORY_IDS } from './categories';

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  '88ym68hf';
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production';
const token = process.env.NEXT_PUBLIC_SANITY_API_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
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

const POST_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage,
  category,
  isUserPost,
  "catSlug": category->slug.current,
  "author": author->name,
  "authorTitle": author->title,
  "categories": categories[]->title,
  body
`;

const fetchOptions = { next: { revalidate: 60 } };

function buildCategoryCountsQuery() {
  return CATEGORY_IDS.map(
    (id) =>
      `"${id}": count(*[_type == "post" && isUserPost != true && defined(category) && category->slug.current == "${id}" && slug.current != "digital-assets-security"])`
  ).join(',\n          ');
}

export async function getPostsByCategory(category) {
  if (!category || !CATEGORY_IDS.includes(category)) {
    return [];
  }

  try {
    return await client.fetch(
      `*[_type == "post" && isUserPost != true && defined(category) && category->slug.current == $category && slug.current != "digital-assets-security"] | order(_createdAt desc) {
        ${POST_FIELDS}
      }`,
      { category },
      fetchOptions
    );
  } catch (error) {
    console.error(`Sanity fetch error in getPostsByCategory(${category}):`, error);
    return [];
  }
}

export async function getPosts() {
  try {
    return await client.fetch(
      `{
        "posts": *[_type == "post" && isUserPost != true && slug.current != "digital-assets-security"] | order(_createdAt desc) {
          ${POST_FIELDS}
        },
        "uncategorizedPosts": *[_type == "post" && isUserPost != true && !defined(category) && (!defined(categories) || count(categories) == 0)] | order(_createdAt desc) {
          ${POST_FIELDS}
        },
        "categoryCounts": {
          ${buildCategoryCountsQuery()}
        },
        "glossary": *[_type == "glossary"] | order(term asc) {
          _id,
          term,
          mn,
          def
        }
      }`,
      {},
      fetchOptions
    );
  } catch (error) {
    console.error('Sanity fetch error in getPosts:', error);
    return null;
  }
}

export async function getCommunityPosts() {
  try {
    return await client.fetch(
      `*[_type == "post" && isUserPost == true] | order(_createdAt desc) {
        ${POST_FIELDS}
      }`,
      {},
      { cache: 'no-store' }
    );
  } catch (error) {
    console.error('Sanity fetch error in getCommunityPosts:', error);
    return [];
  }
}
