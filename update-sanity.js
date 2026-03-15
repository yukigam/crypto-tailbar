const fs = require('fs');

// 1. Update sanity.js
const sanityContent = `import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: '88ym68hf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(client);
export function urlFor(source) {
  return builder.image(source).url();
}

export async function getPosts() {
  return client.fetch(\`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      "author": author->name,
      "categories": categories[]->title,
      body
    }
  \`);
}
`;
fs.writeFileSync('lib/sanity.js', sanityContent);
console.log('sanity.js updated!');

// 2. Update page.js import to include urlFor
let c = fs.readFileSync('app/page.js', 'utf8');

// Add urlFor to import
c = c.replace(
  "import { getPosts } from '../lib/sanity';",
  "import { getPosts, urlFor } from '../lib/sanity';"
);

// Fix the mapped post to use image and full body
const oldMapped = `id:POSTS.length+i+1,
          slug:p.slug?.current||p._id,
          cat:"beginner",
          catLabel:"Medee",
          title:p.title,
          subtitle:p.excerpt||"",
          author:p.author||"Redaktor",
          authorTitle:"Redaktor",
          date:p.publishedAt?.slice(0,10)||new Date().toISOString().slice(0,10),
          readTime:"5",
          views:"0",
          difficulty:"Amarhan",
          featured:false,
          cover:"btc",
          tags:[],
          intro:p.excerpt||p.title,
          sections:[{title:"Info",body:p.excerpt||p.title}]`;

const newMapped = `id:POSTS.length+i+1,
          slug:p.slug?.current||p._id,
          cat:(p.categories&&p.categories[0])?p.categories[0].toLowerCase():"beginner",
          catLabel:(p.categories&&p.categories[0])||"Мэдээ",
          title:p.title,
          subtitle:p.excerpt||"",
          author:p.author||"Редактор",
          authorTitle:"Редактор",
          date:p.publishedAt?.slice(0,10)||new Date().toISOString().slice(0,10),
          readTime:"5",
          views:"0",
          difficulty:"Амархан",
          featured:false,
          cover:"btc",
          sanityImg:p.mainImage?urlFor(p.mainImage):null,
          tags:[],
          intro:p.excerpt||p.title,
          sections:[{title:"Дэлгэрэнгүй",body:Array.isArray(p.body)?p.body.map(b=>b.children?b.children.map(ch=>ch.text).join(""):"").filter(Boolean).join("\n\n"):p.excerpt||p.title}]`;

if(c.includes(oldMapped)){
  c = c.replace(oldMapped, newMapped);
  console.log('Mapped post updated!');
} else {
  console.log('Could not find mapped post template');
}

fs.writeFileSync('app/page.js', c);
console.log('page.js updated!');
