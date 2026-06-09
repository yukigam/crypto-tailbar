import { NextResponse } from 'next/server';
import { CATEGORY_IDS } from '../../../lib/categories';
import { mapSanityPosts } from '../../../lib/mapPost';
import { getPostsByCategory } from '../../../lib/sanity';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || !CATEGORY_IDS.includes(category)) {
    return NextResponse.json(
      { error: 'Invalid or missing category parameter' },
      { status: 400 }
    );
  }

  try {
    const posts = await getPostsByCategory(category);
    return NextResponse.json({ posts: mapSanityPosts(posts) });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
