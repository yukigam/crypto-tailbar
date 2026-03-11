const fs = require('fs');
let c = fs.readFileSync('app/page.js', 'utf8');

const oldLine = 'const [allPosts, setAllPosts] = useState(POSTS);';
const newLine = `const [allPosts, setAllPosts] = useState(POSTS);
  useEffect(() => {
    getPosts().then(data => {
      if (data && data.length > 0) {
        const mapped = data.map((p, i) => ({
          id: POSTS.length + i + 1,
          slug: p.slug?.current || p._id,
          cat: p.categories?.[0]?.toLowerCase() || 'beginner',
          catLabel: p.categories?.[0] || 'Medee',
          title: p.title,
          subtitle: p.excerpt || '',
          author: p.author || 'Redaktor',
          authorTitle: 'Redaktor',
          date: p.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          readTime: '5',
          views: '0',
          difficulty: 'Amarhan',
          featured: false,
          cover: 'btc',
          tags: [],
          intro: p.excerpt || p.title,
          sections: [{ title: 'Delgerengui', body: typeof p.body === 'string' ? p.body : JSON.stringify(p.body) }]
        }));
        setAllPosts([...mapped, ...POSTS]);
      }
    }).catch(e => console.log(e));
  }, []);`;

c = c.replace(oldLine, newLine);
fs.writeFileSync('app/page.js', c);
console.log('Done!');
