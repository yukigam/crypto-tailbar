import { notFound } from 'next/navigation';
import CryptoTailbarClient from '../../CryptoTailbarClient';
import { getClientPageData } from '../../../lib/clientPageData';

export const revalidate = 60;

export default async function PostPage({ params }) {
  const { slug } = await params;
  const pageData = await getClientPageData();
  const postExists =
    pageData.initialPosts.some((p) => p.slug === slug) ||
    pageData.initialCommunityPosts.some((p) => p.slug === slug);

  if (!postExists) {
    notFound();
  }

  return (
    <CryptoTailbarClient
      {...pageData}
      initialPostSlug={slug}
    />
  );
}
