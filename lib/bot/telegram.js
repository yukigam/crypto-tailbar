const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId, text, extra = {}) {
  const res = await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  });
  return res.json();
}

export async function setWebhook(url) {
  const res = await fetch(`${API}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function deleteWebhook() {
  const res = await fetch(`${API}/deleteWebhook`, { method: 'POST' });
  return res.json();
}

export async function getWebhookInfo() {
  const res = await fetch(`${API}/getWebhookInfo`);
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API}/getMe`);
  return res.json();
}

const COMMANDS = {
  start: `👋 <b>Тавтай морил!</b>

Би Crypto Tailbar-ын албан ёсны Telegram бот юм.
Дараах командууд ашиглах боломжтой:

/start — Тавтай морил
/help — Тусламж
/posts — Сүүлийн нийтлэлүүд
/recent — Зах зээлийн мэдээ
/about — Бидний тухай
/generate_all_photos — Бүх зургийг AI-аар үүсгэж Facebook профайл болон cover болгох`,

  help: `🤖 <b>Боломжтой командууд:</b>

/start — Эхлэх
/help — Тусламж
/posts — Сүүлийн 5 нийтлэл
/recent — Зах зээлийн сүүлийн мэдээ
/about — Crypto Tailbar-ын тухай
/generate_cover — AI нүүр зураг үүсгэж Facebook cover болгох
/generate_all_photos — Бүх зургийг AI-аар үүсгэж Facebook профайл болон cover болгох`,

  about: `Crypto Tailbar — Монгол хэлээр крипто валют, блокчейн технологийн тухай мэдээ, мэдээлэл, дүн шинжилгээг хүргэдэг вэбсайт.

🌐 https://crypto-tailbar.vercel.app`,

  generate_cover: `🎨 <b>AI нүүр зураг үүсгэх</b>

/generate_cover [текст] — Тайлбарын дагуу AI зураг үүсгэж, Facebook хуудасны Cover болгоно.

Жишээ: /generate_cover Bitcoin mining in the Mongolian steppe with modern rigs under aurora sky`,

  generate_all_photos: `🎨 <b>Бүх зураг үүсгэх</b>

/generate_all_photos [текст] — Тайлбарын дагуу 2 AI зураг (1:1 профайл зураг + хэвтээ cover зураг) үүсгэж, Facebook хуудасны профайл болон cover-ыг шинэчилнэ.

Жишээ: /generate_all_photos Crypto blockchain theme with gold and blue gradient, modern tech style`,
};

export function getCommand(text) {
  if (!text || !text.startsWith('/')) return null;
  const parts = text.split(' ');
  return parts[0].toLowerCase().replace(/@\w+$/, '');
}

export async function handleCommand(command, chatId) {
  if (COMMANDS[command]) {
    await sendMessage(chatId, COMMANDS[command]);
    return true;
  }
  return false;
}

export function buildPostMessage(post) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  return `<b>${post.title}</b>\n\n${post.subtitle?.slice(0, 200) || ''}\n\n📅 ${date}\n🔗 https://crypto-tailbar.vercel.app/post/${post.slug}`;
}

export async function sendPhoto(chatId, photoUrl, caption) {
  const res = await fetch(`${API}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML' }),
  });
  return res.json();
}
