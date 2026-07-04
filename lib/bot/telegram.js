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
/about — Бидний тухай`,

  help: `🤖 <b>Боломжтой командууд:</b>

/start — Эхлэх
/help — Тусламж
/posts — Сүүлийн 5 нийтлэл
/recent — Зах зээлийн сүүлийн мэдээ
/about — Crypto Tailbar-ын тухай`,

  about: `Crypto Tailbar — Монгол хэлээр крипто валют, блокчейн технологийн тухай мэдээ, мэдээлэл, дүн шинжилгээг хүргэдэг вэбсайт.

🌐 https://cryptomn.pp.ua`,
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
  return `<b>${post.title}</b>\n\n${post.subtitle?.slice(0, 200) || ''}\n\n📅 ${date}\n🔗 https://cryptomn.pp.ua/post/${post.slug}`;
}

export async function sendPhoto(chatId, photoUrl, caption) {
  const res = await fetch(`${API}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML' }),
  });
  return res.json();
}
