import { getPosts, getCommunityPosts } from './sanity';
import { CATEGORIES } from './categories';
import { mapSanityPosts } from './mapPost';

export async function getClientPageData() {
  const [data, communityData] = await Promise.all([
    getPosts(),
    getCommunityPosts(),
  ]);
  const posts = data?.posts || [];
  const mappedPosts = mapSanityPosts(posts);
  const uncategorized = data?.uncategorizedPosts || [];
  const mappedUncategorized = mapSanityPosts(uncategorized);
  const communityPosts = communityData || [];
  const mappedCommunity = mapSanityPosts(communityPosts);

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

  return {
    initialPosts: mappedPosts,
    initialCommunityPosts: mappedCommunity,
    initialUncategorized: mappedUncategorized,
    initialCategories,
    initialGlossary: data?.glossary,
    binanceLink,
  };
}
