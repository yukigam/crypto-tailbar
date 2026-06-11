'use server';

import { client } from '../../../lib/sanity';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 200);
}

function buildBlockContent(text: string) {
  return [
    {
      _type: 'block',
      _key: 'block1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span1',
          text,
          marks: [],
        },
      ],
      markDefs: [],
    },
  ];
}

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !title.trim()) {
    return { error: 'Гарчиг оруулна уу' };
  }
  if (!content || !content.trim()) {
    return { error: 'Текст оруулна уу' };
  }

  const draftId = `drafts.community-${Date.now()}`;

  try {
    await client.create({
      _id: draftId,
      _type: 'post',
      title: title.trim(),
      slug: {
        _type: 'slug',
        current: slugify(title),
      },
      body: buildBlockContent(content.trim()),
    });
    return { success: true };
  } catch (err) {
    console.error('Sanity create error:', err);
    return { error: 'Пост илгээхэд алдаа гарлаа. Дахин оролдоно уу.' };
  }
}
