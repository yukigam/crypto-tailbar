import { NextResponse } from 'next/server';
import { CATEGORY_IDS } from '../../../lib/categories';
import { mapSanityPosts } from '../../../lib/mapPost';
import { getPostsByCategory } from '../../../lib/sanity';
import { createClient } from 'next-sanity';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '88ym68hf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

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

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  const token = searchParams.get('token');

  if (!postId || !token) {
    return NextResponse.json(
      { error: 'postId and token are required' },
      { status: 400 }
    );
  }

  try {
    const doc = await writeClient.fetch(
      `*[_type == "post" && _id == $postId && editToken == $token][0]{_id}`,
      { postId, token }
    );

    if (!doc) {
      return NextResponse.json(
        { error: 'Post not found or token invalid' },
        { status: 404 }
      );
    }

    const tx = writeClient.transaction();
    tx.delete(postId);
    tx.delete(`drafts.${postId}`);
    await tx.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
