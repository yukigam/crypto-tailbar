'use server';

import { createClient } from 'next-sanity';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '88ym68hf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

function slugify(text: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo',
    'ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m',
    'н':'n','о':'o','ө':'o','п':'p','р':'r','с':'s','т':'t',
    'у':'u','ү':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh',
    'щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    'А':'a','Б':'b','В':'v','Г':'g','Д':'d','Е':'e','Ё':'yo',
    'Ж':'zh','З':'z','И':'i','Й':'y','К':'k','Л':'l','М':'m',
    'Н':'n','О':'o','Ө':'o','П':'p','Р':'r','С':'s','Т':'t',
    'У':'u','Ү':'u','Ф':'f','Х':'kh','Ц':'ts','Ч':'ch','Ш':'sh',
    'Щ':'shch','Ъ':'','Ы':'y','Ь':'','Э':'e','Ю':'yu','Я':'ya',
  };
  const suffix = Date.now().toString(36).slice(-6);
  return text
    .split('')
    .map(ch => map[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 193) + '-' + suffix;
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

  const trimmedTitle = title?.trim() || '';
  const trimmedContent = content?.trim() || '';

  if (trimmedTitle.length < 5) {
    return { error: 'Гарчиг хамгийн багадаа 5 тэмдэгт байх ёстой' };
  }
  if (trimmedContent.length < 20) {
    return { error: 'Нийтлэлийн агуулга хэтэрхий богино байна' };
  }

  const slug = slugify(trimmedTitle);
  const editToken = crypto.randomUUID();
  const postId = `community-${Date.now()}`;

  try {
    await writeClient.create({
      _id: postId,
      _type: 'post',
      title: trimmedTitle,
      slug: { _type: 'slug', current: slug },
      body: buildBlockContent(trimmedContent),
      isUserPost: true,
      publishedAt: new Date().toISOString(),
      editToken,
    });

    revalidatePath('/');
    revalidatePath('/community');
  } catch (err) {
    console.error('Sanity create error:', err);
    return { error: 'Пост илгээхэд алдаа гарлаа. Дахин оролдоно уу.' };
  }

  redirect(`/community?postId=${postId}&token=${editToken}`);
}
