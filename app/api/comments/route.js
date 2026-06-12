import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  '88ym68hf';
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production';

const readClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
});

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json(
      { error: 'Missing postId parameter' },
      { status: 400 }
    );
  }

  try {
    const comments = await readClient.fetch(
      `*[_type == "comment" && post._ref == $postId] | order(_createdAt asc) {
        _id,
        name,
        comment,
        createdAt,
        "parent": parent->_id
      }`,
      { postId }
    );
    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { postId, name, comment, parent } = body;

    if (!postId || !name || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, name, comment' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    if (trimmedName.length < 1) {
      return NextResponse.json(
        { error: 'Нэрээ оруулна уу' },
        { status: 400 }
      );
    }
    if (trimmedComment.length < 1) {
      return NextResponse.json(
        { error: 'Сэтгэгдлээ оруулна уу' },
        { status: 400 }
      );
    }

    const doc = {
      _type: 'comment',
      name: trimmedName,
      comment: trimmedComment,
      post: { _type: 'reference', _ref: postId },
      createdAt: new Date().toISOString(),
    };
    if (parent) {
      doc.parent = { _type: 'reference', _ref: parent };
    }

    await writeClient.create(doc);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment create error:', error);
    return NextResponse.json(
      { error: 'Сэтгэгдэл илгээхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
