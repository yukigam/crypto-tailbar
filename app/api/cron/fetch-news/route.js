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

    let rawContent = '';
    try {
      const prompt = `You are a professional crypto news translator for "КриптоТайлбарлагч", a Mongolian crypto education blog.

Translate the English crypto news below into natural, engaging Mongolian. Write it as a professional blog post for beginners.

CRITICAL: All Mongolian text MUST be spelled 100% correctly. Double-check every word for proper Cyrillic Mongolian spelling (жишээ нь: "зээллийг" биш "зээлийг", "компанийн" биш "компаны").

For specialized crypto/finance/tech terms (like "liquidity", "tokenization", "collateral", etc.), write the Mongolian translation followed by a brief explanation in parentheses. Example: "ходоолго (барьцаа болгон тавьсан хөрөнгө)" or "ликвид байдал (хөрвөх чадвар)".

Use pure Mongolian words as much as possible. Avoid Russian loanwords. If you must use a foreign term, explain it in parentheses.

Output ONLY valid JSON with these exact fields:
{
  "title": "Catchy Mongolian title with correct spelling (max 80 chars)",
  "slug": "english-kebab-slug-derived-from-title",
  "body": "Full Mongolian article with 3-5 paragraphs separated by \\n\\n. Each specialized term must have (тайлбар) in parentheses.",
  "excerpt": "1-2 sentence Mongolian summary with correct spelling"
}

Rules:
- Title: informative, catchy, max 80 chars, NO spelling mistakes
- Slug: kebab-case English from the Mongolian title meaning
- Body: detailed, friendly, beginner-oriented, at least 3 paragraphs, spell-checked
- Every technical term gets a brief (тайлбар) in parentheses
- Keep all original facts intact
- Read your output once and fix any spelling errors before finalizing

Original article:
Title: ${article.title}
Published: ${article.pubDate}
Content: ${article.content}`;

      const gRes = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1600 },
        }),
      });
      if (!gRes.ok) { const text = await gRes.text(); throw new Error(`Gemini ${gRes.status}: ${text}`); }
      const gData = await gRes.json();
      rawContent = gData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const raw = stripCodeFences(rawContent);
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
      results.push({ title: article.title, status: 'error', error: err.message, raw: rawContent?.slice(0, 200) });
    }
  }

  return Response.json({ success: true, results });
}
