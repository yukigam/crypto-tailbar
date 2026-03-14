const fs = require('fs');
let c = fs.readFileSync('app/page.js', 'utf8');
const lines = c.split('\n');

// Find the line with sections: [{ title: 'Delgerengui'
let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("sections: [{ title: 'Delgerengui'")) {
    startLine = i;
    break;
  }
}

if (startLine === -1) {
  console.log('Line not found!');
  process.exit(1);
}

console.log('Found at line:', startLine + 1);

// Find end of this broken multi-line expression
// It ends with ') }]' or similar
let endLine = startLine;
for (let i = startLine; i < startLine + 10; i++) {
  if (lines[i].includes("') }]") || lines[i].includes("'') }]")) {
    endLine = i;
    break;
  }
}

console.log('End at line:', endLine + 1);

// Replace all broken lines with one clean line
const cleanLine = "          sections: [{ title: 'Delgerengui', body: p.excerpt || p.title }]";
lines.splice(startLine, endLine - startLine + 1, cleanLine);

// Also fix intro line
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('intro: p.excerpt || (Array.isArray')) {
    lines[i] = "          intro: p.excerpt || p.title,";
    console.log('Fixed intro at line:', i + 1);
    break;
  }
}

fs.writeFileSync('app/page.js', lines.join('\n'));
console.log('Done!');
