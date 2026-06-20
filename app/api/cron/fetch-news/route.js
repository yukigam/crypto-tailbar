import { createClient } from '@sanity/client';
import Parser from 'rss-parser';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const RSS_FEEDS = [
  'https://cointelegraph.com/rss',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cryptopotato.com/feed/',
  'https://news.bitcoin.com/feed/',
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0430-\u044f]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function textToPortableText(text) {
  const blocks = text.split('\n\n').filter(Boolean);
  return blocks.map((p, i) => ({
    _type: 'block',
    _key: `block-${i}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${i}`,
        text: p.trim(),
        marks: [],
      },
    ],
  }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const stripCodeFences = (text) => text.replace(/```(?:json)?\n?/gi, '').trim();

const MAX_ARTICLES_TOTAL = 1;

export async function GET(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '88ym68hf',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
    useCdn: false,
  });

  if (!apiKey) throw new Error('GEMINI_API_KEY env var is NOT SET');
  const GEMINI_MODEL = 'gemini-1.5-flash';

  const parser = new Parser();
  const seen = new Set();
  const articles = [];

  for (const url of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items.slice(0, 3)) {
        const key = item.title?.slice(0, 80).toLowerCase().trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        articles.push({
          title: item.title || '',
          link: item.link || '',
          content: (item.contentSnippet || item.content || '').slice(0, 4000),
          pubDate: item.pubDate || new Date().toISOString(),
        });
        if (articles.length >= MAX_ARTICLES_TOTAL) break;
      }
    } catch {
      // skip failed feed
    }
    if (articles.length >= MAX_ARTICLES_TOTAL) break;
  }

  const results = [];

  for (const [i, article] of articles.entries()) {
    if (i > 0) await sleep(5000);

    const tempSlug = slugify(article.title).slice(0, 100);

    const dup = await sanityClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      { slug: tempSlug },
    );
    if (dup) {
      results.push({ title: article.title, status: 'skipped (duplicate slug)' });
      continue;
    }

    try {
      const prompt = `You are a professional crypto news translator for "КриптоТайлбарлагч", a Mongolian crypto education blog.

Translate the English crypto news below into natural, engaging Mongolian. Write it as a professional blog post for beginners.

Output ONLY valid JSON with these exact fields:
{
  "title": "Catchy Mongolian title (max 80 chars)",
  "slug": "english-kebab-slug-derived-from-title",
  "body": "Full Mongolian article with 3-5 paragraphs separated by \\n\\n",
  "excerpt": "1-2 sentence Mongolian summary"
}

Rules:
- Title: informative, catchy, max 80 chars
- Slug: kebab-case English from the Mongolian title meaning
- Body: detailed, friendly, beginner-oriented, at least 3 paragraphs
- Keep all original facts intact

Original article:
Title: ${article.title}
Published: ${article.pubDate}
Content: ${article.content}`;

      const gRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1600 },
        }),
      });
      if (!gRes.ok) throw new Error(`Gemini ${gRes.status}: ${await gRes.text()}`);
      const gData = await gRes.json();
      const raw = stripCodeFences(gData.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
      const translated = JSON.parse(raw);

      const slug = slugify(translated.slug || article.title).slice(0, 100);

      const dupSlug = await sanityClient.fetch(
        `*[_type == "post" && slug.current == $slug][0]._id`,
        { slug },
      );
      if (dupSlug) {
        results.push({ title: translated.title, status: 'skipped (duplicate slug after AI)' });
        continue;
      }

      const docData = {
        _type: 'post',
        title: translated.title,
        slug: { _type: 'slug', current: slug },
        body: textToPortableText(translated.body),
        excerpt: translated.excerpt || '',
        publishedAt: new Date().toISOString(),
        market: true,
      };

      await sanityClient.mutate([
        { createOrReplace: { _id: slug, ...docData } },
      ]);

      results.push({ title: translated.title, slug, status: 'published' });
    } catch (err) {
      results.push({ title: article.title, status: 'error', error: err.message });
    }
  }

  return Response.json({ success: true, results });
}
