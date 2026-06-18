const { createClient } = require('@sanity/client');
const c = createClient({
  projectId: '88ym68hf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skMZHXVGpXIf74doj8eJ32WwqicSJzpSXeqGWc0Y7gLgfu231qa6WNSXhLkQhywGXXPuRfY9Rgh2sXF7YIUTXRvYcwmN6TMJfRJlt4mb6KJ0bkQBICxGhegWUd58bE2dc5Z9WfJtl97o57zlEdiSwuERrs5bl8TvTke89E2BOHvwLS8Pvxch',
  useCdn: false,
});
c.fetch('*[_type == "post"] | order(publishedAt desc) [0..10] {title, publishedAt, _createdAt, slug}').then(posts => {
  if (!posts.length) {
    console.log('No posts found');
  } else {
    for (const p of posts) {
      console.log(p._createdAt, '| publishedAt:', p.publishedAt, '|', p.title);
    }
  }
}).catch(e => console.error('Err:', e.message));
