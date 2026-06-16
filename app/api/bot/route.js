import { NextResponse } from 'next/server';
import { sendMessage, setWebhook, getWebhookInfo, handleCommand, getCommand, buildPostMessage } from '../../../lib/bot/telegram';
import { postToFacebook } from '../../../lib/bot/facebook';
import { getPosts, getCommunityPosts } from '../../../lib/sanity';
import { mapSanityPosts } from '../../../lib/mapPost';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'set-webhook') {
    const host = request.headers.get('host') || 'crypto-tailbar.vercel.app';
    const webhookUrl = `https://${host}/api/bot`;
    const result = await setWebhook(webhookUrl);
    return NextResponse.json({ success: true, webhookUrl, result });
  }

  if (action === 'webhook-info') {
    const info = await getWebhookInfo();
    return NextResponse.json(info);
  }

  return NextResponse.json({
    name: 'Crypto Tailbar Bot',
    version: '1.0.0',
    endpoints: {
      POST: '/api/bot — Telegram webhook',
      GET: '/api/bot?action=set-webhook — Register webhook',
      GET: '/api/bot?action=webhook-info — Check webhook status',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Handle Telegram webhook update
    if (body.update_id) {
      return handleTelegramUpdate(body);
    }

    // Handle internal action (e.g. from cron job)
    if (body.action === 'post-to-facebook') {
      return handleFacebookPost(body);
    }

    return NextResponse.json({ ok: false, error: 'Unknown request type' }, { status: 400 });
  } catch (err) {
    console.error('Bot webhook error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

async function handleTelegramUpdate(update) {
  const msg = update.message || update.channel_post;
  if (!msg) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || '';

  const command = getCommand(text);
  if (command) {
    const handled = await handleCommand(command, chatId);
    if (handled) return NextResponse.json({ ok: true });
  }

  // /posts — send latest 5 posts
  if (command === '/posts') {
    try {
      const data = await getPosts();
      const posts = mapSanityPosts(data?.posts || []).slice(0, 5);
      if (posts.length === 0) {
        await sendMessage(chatId, 'Одоогоор нийтлэл байхгүй байна.');
      } else {
        await sendMessage(chatId, `📰 <b>Сүүлийн ${posts.length} нийтлэл:</b>\n\n` +
          posts.map((p, i) => `${i + 1}. <a href="https://crypto-tailbar.vercel.app/post/${p.slug}">${p.title}</a>`).join('\n'));
      }
    } catch {
      await sendMessage(chatId, 'Нийтлэлүүдийг татахад алдаа гарлаа.');
    }
    return NextResponse.json({ ok: true });
  }

  // /recent — send market news
  if (command === '/recent') {
    try {
      const data = await getPosts();
      const posts = mapSanityPosts(data?.uncategorizedPosts || []).slice(0, 5);
      if (posts.length === 0) {
        await sendMessage(chatId, 'Зах зээлийн мэдээ байхгүй байна.');
      } else {
        for (const p of posts) {
          const caption = buildPostMessage(p);
          if (p.cover && p.cover.startsWith('http') && !p.cover.startsWith('btc')) {
            await sendMessage(chatId, caption, { disable_web_page_preview: false });
          } else {
            await sendMessage(chatId, caption, { disable_web_page_preview: true });
          }
        }
      }
    } catch {
      await sendMessage(chatId, 'Мэдээ татахад алдаа гарлаа.');
    }
    return NextResponse.json({ ok: true });
  }

  // Unknown command or plain text — show help
  if (command) {
    await handleCommand('help', chatId);
  }

  return NextResponse.json({ ok: true });
}

async function handleFacebookPost(body) {
  const { title, link, message } = body;
  if (!title || !link) {
    return NextResponse.json({ error: 'title and link are required' }, { status: 400 });
  }
  const fbMessage = message || `📰 ${title}\n\nДэлгэрэнгүй: ${link}`;
  const result = await postToFacebook(fbMessage, link, title);
  return NextResponse.json({ success: true, result });
}
