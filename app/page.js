import { getPosts } from '../lib/sanity';
import CryptoTailbarClient from './CryptoTailbarClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const data = await getPosts();
  
  let mappedPosts = [];
  if (data && data.length > 0) {
    mappedPosts = data.map((p, i) => ({
      id: `sanity-${p._id}-${i}`,
      slug: p.slug?.current || p._id,
      cat: "beginner",
      catLabel: "Мэдээ",
      title: p.title,
      subtitle: p.excerpt || "",
      author: p.author || "Редактор",
      authorTitle: "Редактор",
      date: p.publishedAt?.slice(0, 10) || p._createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      readTime: "5",
      views: "0",
      difficulty: "Амархан",
      featured: false,
      cover: "btc",
      tags: [],
      intro: p.excerpt || p.title,
      sections: [{ title: "Мэдээлэл", body: p.excerpt || p.title }]
    }));
  }

  return <CryptoTailbarClient initialPosts={mappedPosts} />;
}
