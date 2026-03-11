import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: '88ym68hf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

// Санитиас бүх нийтлэл авах
export async function getPosts() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      "author": author->name,
      "categories": categories[]->title,
      body
    }
  `);
}

// Нэг нийтлэл авах
export async function getPost(slug) {
  return client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      "author": author->name,
      "categories": categories[]->title,
      body
    }
  `, { slug });
}