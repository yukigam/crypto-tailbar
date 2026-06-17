import { NextResponse } from 'next/server';
import { sendMessage, setWebhook, getWebhookInfo, handleCommand, getCommand, buildPostMessage } from '../../../lib/bot/telegram';
import { postToFacebook, setCoverPhoto, setProfilePhoto } from '../../../lib/bot/facebook';
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

  // /generate_cover — generate AI image and set as Facebook cover
  if (command === '/generate_cover') {
    const prompt = text.slice('/generate_cover'.length).trim();
    if (!prompt) {
      await sendMessage(chatId, 'Зураг үүсгэх текстээ оруулна уу.\n\nЖишээ: <code>/generate_cover Bitcoin mining in the Mongolian steppe with modern rigs under aurora sky</code>');
      return NextResponse.json({ ok: true });
    }
    await sendMessage(chatId, '⏳ Зураг үүсгэж байна... Энэ хэдэн секунд үргэлжилж болно.');
    try {
      const imageUrl = await generateImage(prompt);
      if (!imageUrl) throw new Error('No image URL returned');
      await sendMessage(chatId, '📤 Facebook cover болгон хуулж байна...');
      const fbResult = await setCoverPhoto(imageUrl);
      if (fbResult.id || fbResult.success) {
        await sendMessage(chatId, `✅ Нүүр зураг амжилттай солигдлоо!\n\n🎨 <b>Prompt:</b> ${prompt}\n🖼 <a href="${imageUrl}">Зураг харах</a>`);
      } else {
        await sendMessage(chatId, `❌ Facebook дээр cover солиход алдаа гарлаа: ${JSON.stringify(fbResult)}`);
      }
    } catch (err) {
      await sendMessage(chatId, `❌ Алдаа гарлаа: ${err.message}`);
    }
    return NextResponse.json({ ok: true });
  }

  // /generate_all_photos — generate profile + cover images and update Facebook
  if (command === '/generate_all_photos') {
    const prompt = text.slice('/generate_all_photos'.length).trim();
    if (!prompt) {
      await sendMessage(chatId, 'Зураг үүсгэх текстээ оруулна уу.\n\nЖишээ: <code>/generate_all_photos Crypto blockchain theme with gold and blue gradient, modern tech style</code>');
      return NextResponse.json({ ok: true });
    }
    await sendMessage(chatId, '⏳ 2 зураг (профайл + cover) үүсгэж байна... Энэ хэдэн секунд үргэлжилж болно.');
    try {
      const [profileUrl, coverUrl] = await Promise.all([
        generateImage(prompt, {
          size: '1024x1024',
          suffix: 'Facebook profile picture, square 1:1 aspect ratio, close-up centered subject, professional, high quality, no text, no watermark.',
        }),
        generateImage(prompt, {
          size: '1024x512',
          suffix: 'Facebook page cover photo, landscape orientation, wide banner, high quality, professional look, no text, no watermark.',
        }),
      ]);
      if (!profileUrl && !coverUrl) throw new Error('Both image generations failed');
      await sendMessage(chatId, '📤 Facebook профайл болон cover хуудас руу хуулж байна...');
      const results = await Promise.allSettled([
        profileUrl ? setProfilePhoto(profileUrl) : Promise.resolve(null),
        coverUrl ? setCoverPhoto(coverUrl) : Promise.resolve(null),
      ]);
      let reply = '';
      if (results[0].status === 'fulfilled' && results[0].value?.id) {
        reply += '✅ Профайл зураг амжилттай солигдлоо!\n';
      } else {
        reply += '❌ Профайл зураг солиход алдаа гарлаа.\n';
      }
      if (results[1].status === 'fulfilled' && (results[1].value?.id || results[1].value?.success)) {
        reply += '✅ Cover зураг амжилттай солигдлоо!\n';
      } else {
        reply += '❌ Cover зураг солиход алдаа гарлаа.\n';
      }
      reply += `\n🎨 <b>Prompt:</b> ${prompt}`;
      await sendMessage(chatId, reply);
    } catch (err) {
      await sendMessage(chatId, `❌ Алдаа гарлаа: ${err.message}`);
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

async function generateImage(prompt, { size = '1024x1024', suffix = 'Facebook page cover photo, landscape orientation, high quality, professional look, no text, no watermark.' } = {}) {
  const fullPrompt = `${prompt}. ${suffix}`;

  const res = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://crypto-tailbar.vercel.app',
      'X-Title': 'Crypto Tailbar',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/flux-schnell',
      prompt: fullPrompt,
      n: 1,
      size,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.data?.[0]?.url || null;
}
