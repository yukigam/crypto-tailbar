const fs = require('fs');
let lines = fs.readFileSync('app/page.js', 'utf8').split('\n');

// Fix line 247 (index 246)
for(let i = 240; i < 255; i++){
  if(lines[i] && lines[i].includes('sections:[{title:"Info"')){
    console.log('Found at line:', i+1);
    console.log('Old:', lines[i]);
    lines[i] = `          sections:[{title:"Дэлгэрэнгүй",body:Array.isArray(p.body)?p.body.map(b=>b.children?b.children.map(ch=>ch.text||"").join(""):"").filter(Boolean).join("\\n\\n"):p.excerpt||p.title}]`;
    console.log('New:', lines[i]);
    break;
  }
}

// Fix cover to use sanityImg
for(let i = 230; i < 250; i++){
  if(lines[i] && lines[i].includes('cover:"btc",')){
    console.log('Found cover at line:', i+1);
    lines[i] = lines[i] + '\n          sanityImg:p.mainImage?`https://cdn.sanity.io/images/88ym68hf/production/${p.mainImage.asset._ref.replace("image-","").replace(/-([a-z]+)$/,".$1").replace(/-/g,"/")}`:null,';
    break;
  }
}

fs.writeFileSync('app/page.js', lines.join('\n'));
console.log('Done!');
