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
  `, {}, { next: { revalidate: 0 }, cache: 'no-store' });
}
