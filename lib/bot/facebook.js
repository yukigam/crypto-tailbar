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

export async function setCoverPhoto(imageUrl) {
  if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
    return { error: 'Facebook not configured' };
  }
  // Step 1: Upload the image to the page's photos
  const uploadRes = await fetch(`https://graph.facebook.com/v22.0/${PAGE_ID}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: imageUrl, published: false, access_token: PAGE_ACCESS_TOKEN }),
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.id) return { error: 'Upload failed', uploadData };

  // Step 2: Set the uploaded photo as page cover
  const coverRes = await fetch(`https://graph.facebook.com/v22.0/${PAGE_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cover: uploadData.id, no_feed_story: true, access_token: PAGE_ACCESS_TOKEN }),
  });
  return coverRes.json();
}
