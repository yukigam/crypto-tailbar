const { createClient } = require('@sanity/client');

async function main() {
  const sanityClient = createClient({
    projectId: '88ym68hf',
    dataset: 'production',
    apiVersion: '2024-01-01',
    token: 'skMZHXVGpXIf74doj8eJ32WwqicSJzpSXeqGWc0Y7gLgfu231qa6WNSXhLkQhywGXXPuRfY9Rgh2sXF7YIUTXRvYcwmN6TMJfRJlt4mb6KJ0bkQBICxGhegWUd58bE2dc5Z9WfJtl97o57zlEdiSwuERrs5bl8TvTke89E2BOHvwLS8Pvxch',
    useCdn: false,
  });

  // Check token write access
  try {
    const testResult = await sanityClient.create({
      _type: 'post',
      title: 'TEST POST - DELETE ME',
      slug: { _type: 'slug', current: 'test-post-delete-me-' + Date.now() },
      body: [],
      excerpt: 'test',
      publishedAt: new Date().toISOString(),
    });
    console.log('Sanity token WORKS. Created test doc:', testResult._id);

    // Clean up test doc
    await sanityClient.delete(testResult._id);
    console.log('Test doc deleted');

    // Check if there are posts from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPosts = await sanityClient.fetch(
      '*[_type == "post" && _createdAt >= $today] | order(_createdAt desc) {title, _createdAt}',
      { today: today.toISOString() }
    );
    if (todayPosts.length > 0) {
      console.log('\nPosts created today (' + today.toISOString().slice(0, 10) + '):');
      for (const p of todayPosts) {
        console.log('  -', p._createdAt, p.title);
      }
    } else {
      console.log('\nNo posts created today');
    }
  } catch (err) {
    console.error('Sanity error:', err.message);
  }
}

main();
