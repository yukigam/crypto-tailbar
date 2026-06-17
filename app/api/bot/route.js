import { NextResponse } from 'next/server';
import { waitUntil as vercelWaitUntil } from '@vercel/functions';
import { sendMessage, setWebhook, getWebhookInfo, handleCommand, getCommand, buildPostMessage } from '../../../lib/bot/telegram';
import { postToFacebook, setCoverPhoto, setProfilePhoto } from '../../../lib/bot/facebook';
import { getPosts, getCommunityPosts } from '../../../lib/sanity';
import { mapSanityPosts } from '../../../lib/mapPost';

function getScheduler(request) {
  if (typeof request?.waitUntil === 'function') return request.waitUntil;
  if (typeof globalThis.waitUntil === 'function') return globalThis.waitUntil;
  return vercelWaitUntil;
}

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

    if (body.update_id) {
      return handleTelegramUpdate(request, body);
    }

    if (body.action === 'post-to-facebook') {
      return handleFacebookPost(body);
    }

    return NextResponse.json({ ok: false, error: 'Unknown request type' }, { status: 400 });
  } catch (err) {
    console.error('Bot webhook error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

async function handleTelegramUpdate(request, update) {
  const msg = update.message || update.channel_post;
  if (!msg) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || '';

  const command = getCommand(text);
  const schedule = getScheduler(request);

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

  if (command && ['/start', '/help', '/about'].includes(command)) {
    const handled = await handleCommand(command, chatId);
    if (handled) return NextResponse.json({ ok: true });
  }

  if (command === '/generate_cover') {
    const prompt = text.slice('/generate_cover'.length).trim();
    if (!prompt) {
      await sendMessage(chatId, '🎨 <b>AI нүүр зураг үүсгэх</b>\n\n/generate_cover [текст] — Тайлбарын дагуу AI зураг үүсгэж, Facebook хуудасны Cover болгоно.\n\nЖишээ: <code>/generate_cover Bitcoin mining in the Mongolian steppe with modern rigs under aurora sky</code>');
      return NextResponse.json({ ok: true });
    }
    await sendMessage(chatId, '⏳ Зураг үүсгэж байна... Энэ хэдэн секунд үргэлжилж болно.');
    schedule(runGenerateCover(chatId, prompt));
    return NextResponse.json({ ok: true });
  }

  if (command === '/generate_all_photos') {
    const prompt = text.slice('/generate_all_photos'.length).trim();
    if (!prompt) {
      await sendMessage(chatId, '🎨 <b>Бүх зураг үүсгэх</b>\n\n/generate_all_photos [текст] — Тайлбарын дагуу 2 AI зураг (1:1 профайл зураг + хэвтээ cover зураг) үүсгэж, Facebook хуудасны профайл болон cover-ыг шинэчилнэ.\n\nЖишээ: <code>/generate_all_photos Crypto blockchain theme with gold and blue gradient, modern tech style</code>');
      return NextResponse.json({ ok: true });
    }
    await sendMessage(chatId, '⏳ 2 зураг (профайл + cover) үүсгэж байна... Энэ хэдэн секунд үргэлжилж болно.');
    schedule(runGenerateAllPhotos(chatId, prompt));
    return NextResponse.json({ ok: true });
  }

  if (!command && text.trim()) {
    await sendMessage(chatId, '💬 Бодож байна...');
    schedule(runChatResponse(chatId, text));
    return NextResponse.json({ ok: true });
  }

  if (command) {
    await handleCommand('help', chatId);
  }

  return NextResponse.json({ ok: true });
}

async function runGenerateCover(chatId, prompt) {
  try {
    const imageUrl = await generateImage(prompt);
    if (!imageUrl) throw new Error('OpenRouter зураг үүсгэх API хариулт хоосон байна. Токен эсвэл моделийн хязгаарлалт шалгана уу.');
    await sendMessage(chatId, '📤 Facebook cover болгон хуулж байна...');
    const fbResult = await setCoverPhoto(imageUrl);
    if (fbResult.id || fbResult.success) {
      await sendMessage(chatId, `✅ Нүүр зураг амжилттай солигдлоо!\n\n🎨 <b>Prompt:</b> ${prompt}\n🖼 <a href="${imageUrl}">Зураг харах</a>`);
    } else {
      const fbError = fbResult?.error?.message ? `Facebook алдаа: ${fbResult.error.message}` : `Facebook хариулт: ${JSON.stringify(fbResult)}`;
      await sendMessage(chatId, `❌ Facebook дээр cover солиход алдаа гарлаа.\n\n${fbError}`);
    }
  } catch (err) {
    const errorText = `❌ Алдаа гарлаа: ${err.message}`;
    console.error('runGenerateCover error:', err);
    await sendMessage(chatId, errorText);
  }
}

async function runGenerateAllPhotos(chatId, prompt) {
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
    if (!profileUrl && !coverUrl) throw new Error('OpenRouter зураг үүсгэх API хоёр хариултыг хоосон буцаасан. Токен эсвэл моделийн хязгаарлалт шалгана уу.');
    await sendMessage(chatId, '📤 Facebook профайл болон cover хуудас руу хуулж байна...');
    const results = await Promise.allSettled([
      profileUrl ? setProfilePhoto(profileUrl) : Promise.resolve(null),
      coverUrl ? setCoverPhoto(coverUrl) : Promise.resolve(null),
    ]);
    let reply = '';
    if (results[0].status === 'fulfilled' && results[0].value?.id) {
      reply += '✅ Профайл зураг амжилттай солигдлоо!\n';
    } else {
      const pfErr = results[0].status === 'rejected' ? results[0].reason?.message : (results[0].value?.error?.message || 'тодорхойгүй');
      reply += `❌ Профайл зураг солиход алдаа гарлаа: ${pfErr}\n`;
    }
    if (results[1].status === 'fulfilled' && (results[1].value?.id || results[1].value?.success)) {
      reply += '✅ Cover зураг амжилттай солигдлоо!\n';
    } else {
      const cvErr = results[1].status === 'rejected' ? results[1].reason?.message : (results[1].value?.error?.message || 'тодорхойгүй');
      reply += `❌ Cover зураг солиход алдаа гарлаа: ${cvErr}\n`;
    }
    reply += `\n🎨 <b>Prompt:</b> ${prompt}`;
    await sendMessage(chatId, reply);
  } catch (err) {
    const errorText = `❌ Алдаа гарлаа: ${err.message}`;
    console.error('runGenerateAllPhotos error:', err);
    await sendMessage(chatId, errorText);
  }
}

async function runChatResponse(chatId, text) {
  try {
    const answer = await generateChatResponse(text);
    await sendMessage(chatId, answer);
  } catch (err) {
    const errorText = `❌ Алдаа гарлаа: ${err.message}`;
    console.error('runChatResponse error:', err);
    await sendMessage(chatId, errorText);
  }
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

async function generateChatResponse(prompt) {
  const systemPrompt = 'Та Crypto Tailbar-ын туслах бот юм. Монгол хэлээр крипто валют, блокчейн технологийн тухай асуултад хариулна. Товч, ойлгомжтой, хэрэгцээтэй мэдээлэл өгнө. Хариултаа 3-4 өгүүлбэрээр хязгаарла.';

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://crypto-tailbar.vercel.app',
      'X-Title': 'Crypto Tailbar',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Уучлаарай, хариулт үүсгэж чадсангүй.';
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
    throw new Error(`OpenRouter Image API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.data?.[0]?.url || null;
}
