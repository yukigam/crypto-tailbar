const fs = require('fs');
let c = fs.readFileSync('app/page.js', 'utf8');

// Fix the body parsing to handle portable text blocks
const oldBody = `sections: [{ title: 'Delgerengui', body: typeof p.body === 'string' ? p.body : JSON.stringify(p.body) }]`;
const newBody = `sections: [{ title: 'Delgerengui', body: Array.isArray(p.body) ? p.body.map(b => b.children ? b.children.map(c => c.text).join('') : '').join('\n\n') : (typeof p.body === 'string' ? p.body : '') }]`;

// Also fix intro/excerpt
const oldIntro = `intro: p.excerpt || p.title,`;
const newIntro = `intro: p.excerpt || (Array.isArray(p.body) ? p.body[0]?.children?.[0]?.text || p.title : p.title),`;

c = c.replace(oldBody, newBody);
c = c.replace(oldIntro, newIntro);

fs.writeFileSync('app/page.js', c);
console.log('Done!');
