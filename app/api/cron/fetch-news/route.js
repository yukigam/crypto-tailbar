import { createClient } from '@sanity/client';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const RSS_FEEDS = [
  'https://cointelegraph.com/rss',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://cryptopotato.com/feed/',
  'https://news.bitcoin.com/feed/',
];

const CATEGORY_RULES = [
  { pattern: /bitcoin|btc|satoshi|halving/i, cat: 'bitcoin' },
  { pattern: /ethereum|eth|vitalik|buterin|layer\s*2|arbitrum|optimism|base|polygon|zk-?sync/i, cat: 'ethereum' },
  { pattern: /defi|decentralized finance|liquidity|yield|staking|lending|borrow|aave|compound|uni?swap|curve/i, cat: 'defi' },
  { pattern: /nft|web3|metaverse|token\s*gate|digital.?collectible/i, cat: 'nft-web3' },
  { pattern: /trading|exchange|market|price|analysis|bullish|bearish|altcoin|alt\s*season/i, cat: 'trading' },
  { pattern: /wallet|custody|self.?custody|hardware.?wallet|ledger|trezor|seed.?phrase/i, cat: 'wallet' },
  { pattern: /mining|miner|hashrate|proof.?of.?work|asic|pool/i, cat: 'mining' },
];

function pickCategory(title, content) {
  const text = `${title} ${content}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return rule.cat;
  }
  return 'beginners';
}

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

export async function GET(request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2500,
      responseMimeType: 'application/json',
    },
  });

  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
    useCdn: false,
  });

  const parser = new Parser();
  const seen = new Set();
  const articles = [];

  for (const url of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items.slice(0, 5)) {
        const key = item.title?.slice(0, 80).toLowerCase().trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        articles.push({
          title: item.title || '',
          link: item.link || '',
          content: (item.contentSnippet || item.content || '').slice(0, 4000),
          pubDate: item.pubDate || new Date().toISOString(),
        });
      }
    } catch {
      // skip failed feed
    }
  }

  const results = [];

  for (const article of articles) {
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
  "body": "Full Mongolian article with 3-5 paragraphs separated by \\\\n\\\\n",
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

      const result = await model.generateContent(prompt);
      const raw = result.response.text();
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

      const category = pickCategory(article.title, article.content);

      await sanityClient.create({
        _type: 'post',
        title: translated.title,
        slug: { _type: 'slug', current: slug },
        body: textToPortableText(translated.body),
        category,
        publishedAt: new Date().toISOString(),
      });

      results.push({ title: translated.title, slug, category, status: 'published' });
    } catch (err) {
      results.push({ title: article.title, status: 'error', error: err.message });
    }
  }

  return Response.json({ success: true, results });
}
