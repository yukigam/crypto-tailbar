const fs = require('fs');
let lines = fs.readFileSync('app/page.js', 'utf8').split('\n');

// 1. Add getPosts import after line 2 (react import)
lines[1] = lines[1] + "\nimport { getPosts } from '../lib/sanity';";

// 2. Find line 225 (newsletterDone) and add allPosts state + useEffect after it
let targetLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('newsletterDone, setNewsletterDone')) {
    targetLine = i;
    break;
  }
}

console.log('Found newsletterDone at line:', targetLine + 1);

const newCode = `  const [allPosts, setAllPosts] = useState(POSTS);
  useEffect(()=>{
    getPosts().then(data=>{
      if(data&&data.length>0){
        const mapped=data.map((p,i)=>({
          id:POSTS.length+i+1,
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
          sections:[{title:"Info",body:p.excerpt||p.title}]
        }));
        setAllPosts([...mapped,...POSTS]);
      }
    }).catch(e=>console.log(e));
  },[]);`;

lines.splice(targetLine + 1, 0, newCode);

// 3. Replace POSTS references with allPosts in the render section
let result = lines.join('\n');

// Replace common patterns
result = result
  .replace(/\bPOSTS\.filter\b/g, 'allPosts.filter')
  .replace(/\bPOSTS\.map\b/g, 'allPosts.map')
  .replace(/\bPOSTS\.sort\b/g, 'allPosts.sort')
  .replace(/\bPOSTS\.slice\b/g, 'allPosts.slice')
  .replace(/\bPOSTS\.length\b/g, 'allPosts.length');

fs.writeFileSync('app/page.js', result);
console.log('Done!');
