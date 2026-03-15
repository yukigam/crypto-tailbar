const fs = require('fs');
let c = fs.readFileSync('app/page.js', 'utf8');

// Replace the Binance sponsor button with affiliate link
const oldBtn = `style={{width:"100%",padding:"9px",background:"#f7931a",border:"none",color:"#000",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"sans-serif"}}>Нэгдэх →</button>`;
const newBtn = `style={{width:"100%",padding:"9px",background:"#f7931a",border:"none",color:"#000",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"sans-serif"}} onClick={()=>window.open('https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?ref=GRO_28502_O2DNH','_blank')}>Нэгдэх →</button>`;

if(c.includes(oldBtn)){
  c = c.replace(oldBtn, newBtn);
  fs.writeFileSync('app/page.js', c);
  console.log('Done!');
} else {
  console.log('Button not found, searching...');
  const idx = c.indexOf('Нэгдэх →</button>');
  console.log('Found at index:', idx);
  console.log('Context:', c.slice(idx-200, idx+50));
}
