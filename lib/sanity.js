import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: '88ym68hf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const builder = imageUrlBuilder(client);
export function urlFor(source) {
  return builder.image(source).url();
}

export async function getPosts() {
  return client.fetch(`
    *[_type == "post"] | order(_createdAt desc) [0...10] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      _createdAt,
      mainImage,
      "author": author->name,
      "categories": categories[]->title,
      body
    }
  `, {}, { next: { revalidate: 0 }, cache: 'no-store' });
}
