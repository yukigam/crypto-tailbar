import { getPosts } from '../lib/sanity';
import { CATEGORIES } from '../lib/categories';
import { mapSanityPosts } from '../lib/mapPost';
import CryptoTailbarClient from './CryptoTailbarClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const data = await getPosts();
  const posts = data?.posts || [];
  const mappedPosts = mapSanityPosts(posts);

  const categoryCounts = data?.categoryCounts || {};
  const initialCategories = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    count: categoryCounts[c.id] ?? 0,
  }));

  const binanceLink =
    process.env.NEXT_PUBLIC_BINANCE_LINK ||
    process.env.BINANCE_LINK ||
    'https://www.binance.com/register?ref=561538131';

  return (
    <CryptoTailbarClient
      initialPosts={mappedPosts}
      initialCategories={initialCategories}
      initialGlossary={data?.glossary}
      binanceLink={binanceLink}
    />
  );
}
