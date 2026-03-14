const fs = require('fs');
let c = fs.readFileSync('app/page.js', 'utf8');

// Remove the broken sections/intro lines and replace with clean version
const broken = `intro: p.excerpt || (Array.isArray(p.body) ? p.body[0]?.children?.[0]?.text || p.title : p.title),
          sections: [{ title: 'Delgerengui', body: Array.isArray(p.body) ? p.body.map(b => b.children ? b.children.map(c => c.text).join('') : '').join('\\n\\n') : (typeof p.body === 'string' ? p.body : '') }]`;

const fixed = `intro: p.excerpt || p.title,
          sections: [{ title: 'Delgerengui', body: p.excerpt || p.title }]`;

if (c.includes(broken)) {
  c = c.replace(broken, fixed);
  fs.writeFileSync('app/page.js', c);
  console.log('Fixed!');
} else {
  // Try alternative - find and fix line 246 area
  const lines = c.split('\n');
  console.log('Lines around 244-250:');
  for (let i = 243; i < 252 && i < lines.length; i++) {
    console.log(i+1 + ': ' + lines[i]);
  }
}
