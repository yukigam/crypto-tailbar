const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const API = `https://graph.facebook.com/v22.0/${PAGE_ID}`;

export async function postToFacebook(message, link, linkName) {
  if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
    console.warn('Facebook env vars not configured');
    return { error: 'Facebook not configured' };
  }
  const body = {
    message,
    link,
    name: linkName,
    access_token: PAGE_ACCESS_TOKEN,
  };
  const res = await fetch(`${API}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function postPhotoToFacebook(caption, photoUrl) {
  if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
    return { error: 'Facebook not configured' };
  }
  const body = {
    caption,
    url: photoUrl,
    access_token: PAGE_ACCESS_TOKEN,
  };
  const res = await fetch(`${API}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}
