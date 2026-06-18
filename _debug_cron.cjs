const { createClient } = require('@sanity/client');
const Parser = require('rss-parser');

async function main() {
  console.log('1. Creating Sanity client...');
  const sanityClient = createClient({
    projectId: '88ym68hf',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: 'skMZHXVGpXIf74doj8eJ32WwqicSJzpSXeqGWc0Y7gLgfu231qa6WNSXhLkQhywGXXPuRfY9Rgh2sXF7YIUTXRvYcwmN6TMJfRJlt4mb6KJ0bkQBICxGhegWUd58bE2dc5Z9WfJtl97o57zlEdiSwuERrs5bl8TvTke89E2BOHvwLS8Pvxch',
    useCdn: false,
  });
  console.log('   Sanity client created');

  console.log('2. Testing RSS fetch...');
  const parser = new Parser();
  try {
    const feed = await parser.parseURL('https://cointelegraph.com/rss');
    console.log('   RSS works! Got', feed.items.length, 'items');
    console.log('   First:', feed.items[0]?.title?.slice(0, 50));
  } catch (e) {
    console.log('   RSS FAIL:', e.message);
  }

  console.log('3. Testing environment variables...');
  console.log('   OPENROUTER_API_KEY present:', !!process.env.OPENROUTER_API_KEY);
  console.log('   SANITY_API_WRITE_TOKEN present:', !!process.env.SANITY_API_WRITE_TOKEN);
  console.log('   SANITY_API_TOKEN present:', !!process.env.SANITY_API_TOKEN);
  console.log('   CRON_SECRET present:', !!process.env.CRON_SECRET);

  console.log('4. Testing OpenRouter call...');
  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || 'no-key'}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: 'Say "test OK" and nothing else' }],
        max_tokens: 20,
      }),
    });
    const orData = await orRes.text();
    console.log('   OpenRouter status:', orRes.status);
    console.log('   Response:', orData.slice(0, 100));
  } catch (e) {
    console.log('   OpenRouter FAIL:', e.message);
  }

  console.log('\nDone.');
}

main();
