'use client';
import { useState, useEffect } from "react";
import { getPosts } from '../lib/sanity';
// ── PALETTE ──────────────────────────────────────────
const C = {
  bg: "#fafaf7",
  bgDark: "#f2f2ed",
  ink: "#1a1a14",
  inkLight: "#5a5a50",
  inkFaint: "#9a9a8a",
  accent: "#0a7c4e",
  accentLight: "#e8f5ef",
  accentBright: "#12a868",
  red: "#c8002a",
  gold: "#c4902a",
  border: "#e4e4dc",
  borderDark: "#d0d0c4",
  white: "#ffffff",
};

// ── DATA ─────────────────────────────────────────────
const CATEGORIES = [
  { id:"beginner", label:"Эхлэгчдэд", icon:"🌱", color:"#0a7c4e", count:12 },
  { id:"bitcoin", label:"Bitcoin", icon:"₿", color:"#f7931a", count:8 },
  { id:"ethereum", label:"Ethereum", icon:"Ξ", color:"#627eea", count:6 },
  { id:"defi", label:"DeFi", icon:"🏦", color:"#8b5cf6", count:9 },
  { id:"trading", label:"Арилжаа", icon:"📈", color:"#c8002a", count:7 },
  { id:"wallets", label:"Түрийвч", icon:"👛", color:"#c4902a", count:5 },
  { id:"nft", label:"NFT & Web3", icon:"🖼", color:"#06b6d4", count:4 },
  { id:"mining", label:"Майнинг", icon:"⛏", color:"#64748b", count:3 },
];

const POSTS = [
  {
    id:1, slug:"bitcoin-yuu-ve",
    cat:"beginner", catLabel:"Эхлэгчдэд",
    title:"Bitcoin гэж яг юу вэ? Эхлэгчдэд зориулсан бүрэн тайлбар",
    subtitle:"2009 онд үүссэн дэлхийн хамгийн анхны крипто валютын тухай бүх зүйлийг энгийн монгол хэлэнд ойлгомжтойгоор тайлбарлав.",
    author:"Б.Мөнхбаяр", authorTitle:"Крипто судлаач", date:"2026-03-01",
    readTime:"8", views:"34.2K", difficulty:"Амархан",
    featured:true, cover:"btc",
    tags:["Bitcoin","Крипто","Эхлэгч"],
    intro:"Bitcoin бол дэлхийн хамгийн том, хамгийн алдартай крипто валют юм. Гэхдээ яг юу болох, хэрхэн ажилладаг, яагаад үнэтэй байдгийг мэддэг хүн цөөн...",
    sections:[
      { title:"Bitcoin гэж юу вэ?", body:"Bitcoin (BTC) бол 2009 онд Satoshi Nakamoto хэмээх нэрмэрцэн хүн буюу хэсэг хүмүүсийн бүтээсэн анхны дижитал мөнгөн тэмдэгт юм. Ямар ч банк, засгийн газар удирддаггүй, харин олон мянган компьютер нэгэн зэрэг баталгаажуулдаг систем дээр суурилдаг.\n\nТа Bitcoin-ийг \"интернэт дэх алт\" гэж төсөөлж болно — дэлхийн хаана ч, хэнд ч, хэдхэн минутын дотор, банкны зуучлалгүйгээр илгээх боломжтой."},
      { title:"Блокчейн яаж ажилладаг вэ?", body:"Blockchain бол бүх Bitcoin гүйлгээний бүртгэл хадгалдаг тархмал дэвтэр юм. Нэг компьютер биш, харин дэлхий даяар 10,000+ компьютерт нэгэн зэрэг хадгалагддаг учраас хэн нэгэн хуурамчаар өөрчлөх боломжгүй.\n\nДараах дарааллаар ажилладаг:\n1. Та Bitcoin илгээнэ\n2. Сүлжээний компьютерууд (node) гүйлгээг шалгана\n3. Олборлогчид (miner) баталгаажуулна\n4. Блок руу бичигдэнэ — мөнхөд хадгалагдана"},
      { title:"Яагаад Bitcoin үнэтэй байдаг вэ?", body:"Bitcoin-ийн нийт тоо 21 сая хүртэл л гарах боломжтой. Одоогоор ~19.6 сая нь аль хэдийн олборлогдсон, 1.4 сая нь л үлдсэн байна. Хязгаарлагдмал нийлүүлэлт + нэмэгдэж буй эрэлт = үнэ өснө.\n\nМөн дэлхий даяар 400+ сая хүн Bitcoin эзэмшдэг болсон. Компани, засгийн газрууд нөөц болгон худалдаж авч байна (АНУ-ын засгийн газар 200,000+ BTC нөөцтэй)."},
    ]
  },
  {
    id:2, slug:"crypto-wallet",
    cat:"wallets", catLabel:"Түрийвч",
    title:"Крипто түрийвч гэж юу вэ? MetaMask, Trust Wallet-ийг хэрхэн ашиглах вэ?",
    subtitle:"Хөрөнгөө аюулгүй хадгалах хамгийн чухал ойлголт — private key, seed phrase, hot/cold wallet.",
    author:"Д.Сарнай", authorTitle:"Блокчейн хөгжүүлэгч", date:"2026-02-28",
    readTime:"10", views:"28.7K", difficulty:"Амархан",
    featured:true, cover:"wallet",
    tags:["Түрийвч","MetaMask","Аюулгүй байдал"],
    intro:"Крипто эзэмшихийн тулд заавал crypto wallet байх ёстой. Банкны данс шиг боловч ялгаатай тал нь өөрөө л эзэмшигч нь байдаг...",
    sections:[
      { title:"Crypto wallet гэж юу вэ?", body:"Wallet бол таны крипто хадгалдаг програм юм. Гэхдээ яг нарийн хэлбэл, таны wallet дотор крипто биш — харин таны Private Key хадгалагдана. Private Key л таних тэмдэглэгээ нь, тэр нь байхад крипто чинийх байна.\n\nТүрийвч хоёр төрлийн байна:\n• Hot wallet — интернэттэй холбогдсон (MetaMask, Trust Wallet)\n• Cold wallet — интернэтгүй (Ledger, Trezor) — аюулгүй хадгалалт"},
      { title:"Seed phrase яагаад чухал вэ?", body:"Wallet үүсгэхэд 12 буюу 24 үг гарна — энийг Seed Phrase буюу Recovery Phrase гэнэ. ЭНЭ БОЛ ТАНЫ БҮГД. Хэн нэгэн энэ үгийг мэдвэл таны бүх крипто авч чадна.\n\n✅ Цаасан дээр бич, аюулгүй газар хадгал\n✅ Хэзээ ч хэнд хэлж болохгүй\n❌ Фото авч болохгүй\n❌ Cloud-д хадгалж болохгүй\n❌ Имэйлээр явуулж болохгүй"},
    ]
  },
  {
    id:3, slug:"defi-tailbar",
    cat:"defi", catLabel:"DeFi",
    title:"DeFi (Decentralized Finance) гэж юу вэ? Банкгүй санхүү яаж ажилладаг вэ?",
    subtitle:"Банкны зуучлалгүйгээр зээл авах, хүү олох, арилжаа хийх — DeFi-ийн бүх зүйлийг тайлбарлав.",
    author:"Н.Болдбаатар", authorTitle:"DeFi судлаач", date:"2026-02-25",
    readTime:"12", views:"19.4K", difficulty:"Дунд",
    featured:false, cover:"defi",
    tags:["DeFi","Uniswap","Yield","Staking"],
    intro:"DeFi буюу Decentralized Finance — энэ нь банк, даатгал, зах зээл гэх санхүүгийн бүх үйлчилгээг блокчейн дээр ажиллуулдаг систем юм...",
    sections:[
      { title:"DeFi яаж ажилладаг вэ?", body:"Уламжлалт санхүүд банк, брокер зэрэг зуучлагч байдаг. DeFi-д эдгээрийн оронд Smart Contract буюу ухаалаг гэрээ байна. Ухаалаг гэрээ бол код — тодорхой нөхцөл хангагдахад автоматаар ажиллана, хүний оролцоо шаардахгүй." },
    ]
  },
  {
    id:4, slug:"ethereum-tailbar",
    cat:"ethereum", catLabel:"Ethereum",
    title:"Ethereum гэж юу вэ? Bitcoin-аас юугаараа ялгаатай вэ?",
    subtitle:"Дэлхийн хамгийн том smart contract платформын тухай бүрэн тайлбар.",
    author:"Б.Мөнхбаяр", authorTitle:"Крипто судлаач", date:"2026-02-22",
    readTime:"9", views:"16.8K", difficulty:"Амархан",
    featured:false, cover:"eth",
    tags:["Ethereum","Smart Contract","Gas"],
    intro:"Ethereum бол зөвхөн мөнгөн тэмдэгт биш — энэ нь дэлхийн хамгийн том programmable blockchain юм...",
    sections:[{ title:"Ethereum яагаад тусгай вэ?", body:"Bitcoin зөвхөн мөнгөн тэмдэгт болгон зориулагдсан бол Ethereum бол програмчлагдах блокчейн юм. Ethereum дээр хэн ч application бичиж, deploy хийж болно — тэдгээрийг dApp (decentralized app) гэнэ." }]
  },
  {
    id:5, slug:"crypto-tax-mongolia",
    cat:"trading", catLabel:"Арилжаа",
    title:"Монголд крипто валютын татвар хэрхэн тооцдог вэ? 2026 оны тайлбар",
    subtitle:"Монгол Улсын хуулийн дагуу крипто орлогоос татвар хэрхэн ногдуулах тухай.",
    author:"Г.Цэрэнпунцаг", authorTitle:"Санхүүгийн зөвлөх", date:"2026-02-20",
    readTime:"7", views:"41.2K", difficulty:"Дунд",
    featured:false, cover:"law",
    tags:["Татвар","Монгол хууль","Орлого"],
    intro:"Монголд крипто арилжааны орлогоос татвар ногдуулах уу? Хэрхэн тооцох вэ? Олон хүн мэдэхгүй байдаг чухал мэдээлэл...",
    sections:[{ title:"Монголын хуулийн байдал", body:"2025 оноос хойш Монгол Улс крипто орлогыг \"бусад орлого\" ангилалд оруулж 10%-ийн татвар ногдуулдаг болсон. Жилд 6 сая төгрөгөөс дээш орлого авбал заавал мэдүүлэх шаардлагатай." }]
  },
  {
    id:6, slug:"staking-guide",
    cat:"defi", catLabel:"DeFi",
    title:"Staking гэж юу вэ? Крипто хадгалаад хүү хэрхэн авах вэ?",
    subtitle:"Идэвхгүй орлого олох хамгийн хялбар арга — staking, yield farming, liquidity providing.",
    author:"Д.Сарнай", authorTitle:"Блокчейн хөгжүүлэгч", date:"2026-02-18",
    readTime:"8", views:"22.1K", difficulty:"Амархан",
    featured:false, cover:"staking",
    tags:["Staking","Passive Income","APY"],
    intro:"Стейкинг бол крипто валютаа платформд байршуулж, жилийн хүүтэй төстэй урамшуулал авах арга юм...",
    sections:[{ title:"Staking яаж ажилладаг вэ?", body:"Proof of Stake блокчейнд (Ethereum, Solana, Cardano г.м.) гүйлгээг баталгаажуулахын тулд validator-ууд крипто барьцаалдаг. Та барьцаалсан хэмжээнийхээ дагуу шагнал авна." }]
  },
  {
    id:7, slug:"bitcoin-mining",
    cat:"mining", catLabel:"Майнинг",
    title:"Bitcoin майнинг гэж юу вэ? Монголд ашигтай юу?",
    subtitle:"Олборлолтын зардал, орлого, АСИК тоног төхөөрөмж — бодит тооцоо.",
    author:"Н.Болдбаатар", authorTitle:"DeFi судлаач", date:"2026-02-15",
    readTime:"11", views:"18.3K", difficulty:"Дунд",
    featured:false, cover:"mining",
    tags:["Майнинг","ASIC","Цахилгаан"],
    intro:"Bitcoin mining буюу олборлолт гэж юу болох, Монголд хийхэд ашигтай эсэхийг бодит тооцоогоор авч үзлээ...",
    sections:[{ title:"Mining яаж ажилладаг вэ?", body:"Mining бол математикийн хэцүү бодлого компьютераар шийдэж, блок үүсгэх процесс юм. Хамгийн түрүүнд шийдсэн компьютер Bitcoin шагнал авна (одоогоор 3.125 BTC/блок)." }]
  },
  {
    id:8, slug:"nft-tailbar",
    cat:"nft", catLabel:"NFT & Web3",
    title:"NFT гэж яг юу вэ? Яагаад зарим нь тэрбум төгрөгт зарагддаг вэ?",
    subtitle:"Non-Fungible Token-ий тухай бүх зүйл — урлаг, тоглоом, зохиогчийн эрх.",
    author:"Г.Цэрэнпунцаг", authorTitle:"Санхүүгийн зөвлөх", date:"2026-02-10",
    readTime:"7", views:"29.5K", difficulty:"Амархан",
    featured:false, cover:"nft",
    tags:["NFT","OpenSea","Web3","Digital Art"],
    intro:"NFT буюу Non-Fungible Token — нэгдүгээрт \"unique\" буюу давтагдашгүй дижитал эд зүйл...",
    sections:[{ title:"NFT яаж ажилладаг вэ?", body:"NFT бол блокчейн дээр бүртгэгдсэн өмчлөлийн баримт бичиг юм. Зураг, дуу, тоглоомын зүйл, видео г.м. бүх дижитал агуулгыг NFT болгож болно. Хэн эзэмшиж байгааг блокчейн баталгаажуулна." }]
  },
  {
    id:9, slug:"bitcoin-price-history",
    cat:"bitcoin", catLabel:"Bitcoin",
    title:"Bitcoin-ийн үнийн түүх: $0-оос $100,000 хүртэлх аялал",
    subtitle:"2009 оноос өнөөдрийг хүртэлх Bitcoin-ийн үнийн өөрчлөлт, чухал үйл явдлууд.",
    author:"Б.Мөнхбаяр", authorTitle:"Крипто судлаач", date:"2026-02-05",
    readTime:"9", views:"21.3K", difficulty:"Амархан",
    featured:false, cover:"btc",
    tags:["Bitcoin","Үнэ","Түүх"],
    intro:"Bitcoin 2009 онд дөнгөж $0 үнэтэй байсан бол өнөөдөр нэг ширхэг нь $90,000 гаруй үнэтэй болжээ...",
    sections:[
      { title:"Bitcoin-ийн үнийн гол цэгүүд", body:"2009: $0 — Satoshi анхны блокийг олборлов\n2010: $0.01 — Анхны бодит арилжаа (10,000 BTC = 2 пицца)\n2013: $1,000 — Анхны мянган доллар давав\n2017: $20,000 — Түүхэн дээд цэг\n2021: $69,000 — Шинэ рекорд\n2024: $100,000 — Зуун мянгыг давав" },
      { title:"Яагаад үнэ ингэж өснө вэ?", body:"Bitcoin-ийн үнэ нэмэгдэх гол шалтгаанууд:\n\n1. Halving — 4 жил тутам шагнал хагасдана, нийлүүлэлт буурна\n2. Institutional investment — BlackRock, Fidelity зэрэг томоохон компаниуд оруулалт хийж байна\n3. ETF батлагдсан — 2024 онд АНУ-д Bitcoin ETF зөвшөөрөгдсөн\n4. Хязгаарлагдмал тоо — Зөвхөн 21 сая BTC гарна" },
    ]
  },
  {
    id:10, slug:"bitcoin-halving",
    cat:"bitcoin", catLabel:"Bitcoin",
    title:"Bitcoin Halving гэж юу вэ? 2024 оны Halving яагаад чухал байсан вэ?",
    subtitle:"4 жил тутам болдог энэ үйл явдал Bitcoin-ийн үнэд хэрхэн нөлөөлдөг вэ?",
    author:"Б.Мөнхбаяр", authorTitle:"Крипто судлаач", date:"2026-01-28",
    readTime:"7", views:"18.6K", difficulty:"Амархан",
    featured:false, cover:"btc",
    tags:["Bitcoin","Halving","Mining"],
    intro:"Halving бол Bitcoin-ийн хамгийн чухал үйл явдлуудын нэг. 4 жил тутам олборлогчдын шагнал хагасдаж, Bitcoin-ийн нийлүүлэлт буурдаг...",
    sections:[
      { title:"Halving яаж ажилладаг вэ?", body:"Bitcoin-ийн код дотор 210,000 блок бүрт (≈4 жил) олборлогчдын шагнал автоматаар хагасдах заалт байдаг.\n\n2009: 50 BTC/блок\n2012: 25 BTC/блок\n2016: 12.5 BTC/блок\n2020: 6.25 BTC/блок\n2024: 3.125 BTC/блок" },
    ]
  },
  {
    id:11, slug:"bitcoin-wallet-beginner",
    cat:"bitcoin", catLabel:"Bitcoin",
    title:"Bitcoin анх удаа хэрхэн худалдаж авах вэ? Алхам алхмаар заавар",
    subtitle:"Binance, OKX дээр Bitcoin авах бүрэн гарын авлага — эхлэгчдэд зориулав.",
    author:"Д.Сарнай", authorTitle:"Блокчейн хөгжүүлэгч", date:"2026-01-20",
    readTime:"10", views:"35.1K", difficulty:"Амархан",
    featured:false, cover:"btc",
    tags:["Bitcoin","Binance","Худалдаа"],
    intro:"Bitcoin авахыг хүссэн ч хаанаас эхлэхээ мэдэхгүй байгаа бол энэ нийтлэл таны төлөө...",
    sections:[
      { title:"Алхам 1: Биржид бүртгүүлэх", body:"Хамгийн хялбар арга бол Binance эсвэл OKX бирж дээр бүртгүүлэх. Эдгээр бирж Монголд хамгийн түгээмэл ашиглагддаг.\n\n1. binance.com руу орно\n2. Email-ээрээ бүртгүүлнэ\n3. KYC баталгаажуулалт хийнэ (иргэний үнэмлэх)\n4. Төгрөгөөр орлого нэмнэ (P2P арилжааг ашиглан)\n5. Bitcoin худалдаж авна" },
    ]
  },
];

const GLOSSARY = [
  { term:"Blockchain", mn:"Блокчейн", def:"Гүйлгээний бүртгэл хадгалдаг тархмал, хуурамчлах боломжгүй дэвтэр" },
  { term:"Private Key", mn:"Хувийн түлхүүр", def:"Таны криптод нэвтрэх нууц код — хэзээ ч хэнд хэлж болохгүй" },
  { term:"Seed Phrase", mn:"Нөөцлөх үгс", def:"Wallet сэргээхэд ашиглах 12-24 үгний дараалал" },
  { term:"Gas Fee", mn:"Гүйлгээний хураамж", def:"Ethereum гүйлгээний цахилгааны зардал шиг төлдөг хураамж" },
  { term:"DeFi", mn:"Захиргаагүй санхүү", def:"Банкны зуучлалгүй санхүүгийн үйлчилгээ" },
  { term:"Staking", mn:"Барьцаалах", def:"Крипто барьцаалж, шагнал хүлээн авах" },
  { term:"NFT", mn:"Давтагдашгүй токен", def:"Дижитал өмчлөлийн баримт" },
  { term:"HODL", mn:"Удаан хадгалах", def:"Үнэ унасан ч зарахгүй хадгалах стратеги" },
  { term:"Altcoin", mn:"Бусад крипто", def:"Bitcoin-аас бусад бүх крипто валют" },
  { term:"Bull/Bear", mn:"Өсөх/буурах", def:"Bull = зах зээл өсч байна, Bear = буурч байна" },
  { term:"FOMO", mn:"Алдахаас эмээх", def:"Fear Of Missing Out — сэтгэл хөдлөлөөр худалдаа хийх" },
  { term:"DYOR", mn:"Өөрөө судал", def:"Do Your Own Research — бусдын үгэнд найдалгүй судлаарай" },
];

const COVER_GRADIENTS = {
  btc: "linear-gradient(135deg,#fff7ed,#fed7aa)",
  wallet: "linear-gradient(135deg,#f0fdf4,#bbf7d0)",
  defi: "linear-gradient(135deg,#faf5ff,#ddd6fe)",
  eth: "linear-gradient(135deg,#eff6ff,#bfdbfe)",
  law: "linear-gradient(135deg,#fef2f2,#fecaca)",
  staking: "linear-gradient(135deg,#ecfdf5,#a7f3d0)",
  mining: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
  nft: "linear-gradient(135deg,#f0fdfa,#99f6e4)",
};
const COVER_ICON = { btc:"₿", wallet:"👛", defi:"🏦", eth:"Ξ", law:"⚖️", staking:"🌱", mining:"⛏", nft:"🖼" };

function diffColor(d){ return d==="Амархан"?C.accent:d==="Дунд"?C.gold:C.red; }



// ── MAIN ─────────────────────────────────────────────
export default function CryptoTailbar() {
  const [screen, setScreen] = useState("home");
  const [activePost, setActivePost] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [glossaryQ, setGlossaryQ] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [allPosts, setAllPosts] = useState(POSTS);
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
          sections: [{ title: 'Delgerengui', body: p.excerpt || p.title }]
        }));
        setAllPosts([...mapped, ...POSTS]);
      }
    }).catch(e => console.log(e));
  }, []);

  // Admin form state
  const [adminPass, setAdminPass] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);
  const [newPost, setNewPost] = useState({
    title:"", subtitle:"", intro:"", body:"", author:"Б.Мөнхбаяр",
    cat:"beginner", readTime:"5", difficulty:"Амархан", tags:""
  });
  const [adminSaved, setAdminSaved] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);
  function handleLogoClick(){
    const next = logoClicks+1;
    setLogoClicks(next);
    if(next>=5){ setScreen("admin"); setLogoClicks(0); }
    else setScreen("home");
  }

  function handleAddPost(){
    if(!newPost.title||!newPost.intro||!newPost.body) return;
    const p = {
      id: allPosts.length+1,
      slug: newPost.title.toLowerCase().replace(/\s+/g,"-").slice(0,40),
      cat: newPost.cat,
      catLabel: CATEGORIES.find(c=>c.id===newPost.cat)?.label||"",
      title: newPost.title,
      subtitle: newPost.subtitle,
      author: newPost.author,
      authorTitle: "Редактор",
      date: new Date().toISOString().slice(0,10),
      readTime: newPost.readTime,
      views: "0",
      difficulty: newPost.difficulty,
      featured: false,
      cover: "btc",
      tags: newPost.tags.split(",").map(t=>t.trim()).filter(Boolean),
      intro: newPost.intro,
      sections:[{ title:"Дэлгэрэнгүй", body: newPost.body }]
    };
    setAllPosts(prev=>[p,...prev]);
    setAdminSaved(true);
    setNewPost({title:"",subtitle:"",intro:"",body:"",author:"Б.Мөнхбаяр",cat:"beginner",readTime:"5",difficulty:"Амархан",tags:""});
    setTimeout(()=>setAdminSaved(false),3000);
  }

  const catPosts = activeCat ? allPosts.filter(p=>p.cat===activeCat) : [];
  const searchResults = searchQ.length>1 ? allPosts.filter(p=>p.title.toLowerCase().includes(searchQ.toLowerCase())||p.tags.some(t=>t.toLowerCase().includes(searchQ.toLowerCase()))) : [];
  const filtered_glossary = glossaryQ ? GLOSSARY.filter(g=>g.term.toLowerCase().includes(glossaryQ.toLowerCase())||g.mn.includes(glossaryQ)) : GLOSSARY;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:"'Georgia','Times New Roman',serif"}}>

      {/* ── HEADER ── */}
      <header style={{background:C.white,borderBottom:`2px solid ${C.ink}`,position:"sticky",top:0,zIndex:200}}>
        {/* Top strip */}
        <div style={{background:C.ink,padding:"6px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:16,fontSize:11,color:"#aaa",letterSpacing:"0.05em"}}>
            <span style={{color:"#fff",fontWeight:700}}>КРИПТО ТАЙЛБАРЛАГЧ</span>
            <span>·</span>
            <span>{new Date().toLocaleDateString("mn-MN",{year:"numeric",month:"long",day:"numeric"})}</span>
          </div>
          <div style={{display:"flex",gap:14,fontSize:11,color:"#888"}}>
            {["Telegram","Twitter","Facebook"].map(s=>(
              <span key={s} style={{cursor:"pointer",color:"#888"}} onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="#888"}>{s}</span>
            ))}
          </div>
        </div>

        {/* Logo row */}
        <div style={{maxWidth:1200,margin:"0 auto",padding:"18px 24px",display:"flex",alignItems:"center",gap:20}}>
          <div onClick={handleLogoClick} style={{cursor:"pointer",flex:1}}>
            <div style={{display:"flex",alignItems:"baseline",gap:3}}>
              <span style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:900,letterSpacing:"-2px",color:C.ink,lineHeight:1,fontFamily:"Georgia,serif"}}>Крипто</span>
              <span style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:900,letterSpacing:"-2px",color:C.accent,lineHeight:1,fontFamily:"Georgia,serif"}}>Тайлбарлагч</span>
            </div>
            <div style={{fontSize:11,color:C.inkFaint,letterSpacing:"0.15em",marginTop:2,fontFamily:"sans-serif",fontWeight:400}}>МОНГОЛ ХЭЛЭН ДЭХ КРИПТО МЭДЛЭГ</div>
          </div>
          <div style={{flex:2}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setSearchOpen(o=>!o)} style={{background:"none",border:`1.5px solid ${C.borderDark}`,color:C.inkLight,padding:"8px 13px",borderRadius:6,cursor:"pointer",fontSize:14,fontFamily:"sans-serif"}}>🔍</button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{borderTop:`1px solid ${C.border}`,background:C.white}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",overflowX:"auto"}}>
            {[["home","Нүүр"],["news","Сүүлийн мэдээ"],["glossary","Толь бичиг"],["about","Бидний тухай"]].concat(CATEGORIES.slice(0,5).map(c=>[c.id,c.label])).map(([id,label])=>(
              <button key={id} onClick={()=>id==="home"?setScreen("home"):id==="glossary"||id==="about"||id==="news"?setScreen(id):openCat(id)}
                style={{background:"none",border:"none",borderBottom:`2.5px solid ${(screen===id||(screen==="category"&&activeCat===id))?"#1a1a14":"transparent"}`,color:(screen===id||(screen==="category"&&activeCat===id))?C.ink:C.inkLight,padding:"11px 16px",cursor:"pointer",fontFamily:"sans-serif",fontSize:13,fontWeight:(screen===id||(screen==="category"&&activeCat===id))?700:400,whiteSpace:"nowrap",transition:"color 0.15s"}}>
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Search */}
        {searchOpen&&(
          <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 24px"}}>
            <div style={{maxWidth:1200,margin:"0 auto"}}>
              <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Нийтлэл хайх... (жишээ: Bitcoin, DeFi, Staking)"
                style={{width:"100%",padding:"11px 16px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:8,color:C.ink,fontSize:15,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
              {searchResults.length>0&&(
                <div style={{marginTop:8,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",background:C.white}}>
                  {searchResults.map(p=>(
                    <div key={p.id} onClick={()=>{openPost(p);setSearchOpen(false);setSearchQ("");}} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.accentLight}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{fontSize:18}}>{COVER_ICON[p.cover]}</span>
                      <div><div style={{fontSize:14,fontWeight:600,color:C.ink,fontFamily:"sans-serif"}}>{p.title}</div><div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif",marginTop:2}}>{p.catLabel} · {p.readTime} мин</div></div>
                    </div>
                  ))}
                </div>
              )}
              {searchQ.length>1&&searchResults.length===0&&<div style={{color:C.inkFaint,fontSize:13,padding:"8px 4px",fontFamily:"sans-serif"}}>Илэрц олдсонгүй</div>}
            </div>
          </div>
        )}
      </header>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px"}}>

        {/* ══ HOME ══════════════════════════════════════ */}
        {screen==="home"&&(
          <div style={{paddingTop:36}}>
            {/* Hero featured */}
            <div style={{display:"grid",gridTemplateColumns:"5fr 3fr",gap:1,marginBottom:36,border:`1.5px solid ${C.ink}`,borderRadius:4,overflow:"hidden"}}>
              {/* Main hero */}
              {allPosts.slice(0,1).map(p=>(
                <div key={p.id} onClick={()=>openPost(p)} style={{cursor:"pointer",padding:"32px 36px",background:COVER_GRADIENTS[p.cover],position:"relative",borderRight:`1px solid ${C.ink}`}}>
                  <div style={{fontSize:60,marginBottom:16,opacity:0.5}}>{COVER_ICON[p.cover]}</div>
                  <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                    <span style={{background:C.ink,color:"#fff",padding:"3px 10px",fontSize:10,fontWeight:800,letterSpacing:"0.1em",fontFamily:"sans-serif"}}>ОНЦЛОХ</span>
                    <span style={{background:C.accent,color:"#fff",padding:"3px 10px",fontSize:10,fontWeight:700,fontFamily:"sans-serif"}}>{p.catLabel.toUpperCase()}</span>
                    <span style={{fontSize:10,color:diffColor(p.difficulty),fontWeight:700,fontFamily:"sans-serif",background:"rgba(255,255,255,0.7)",padding:"3px 8px",borderRadius:3}}>{p.difficulty}</span>
                  </div>
                  <h1 style={{margin:"0 0 14px",fontSize:"clamp(20px,2.5vw,32px)",fontWeight:900,lineHeight:1.2,color:C.ink,fontFamily:"Georgia,serif"}}>{p.title}</h1>
                  <p style={{margin:"0 0 18px",color:C.inkLight,fontSize:15,lineHeight:1.65,fontFamily:"sans-serif"}}>{p.intro}</p>
                  <div style={{display:"flex",gap:14,fontSize:12,color:C.inkFaint,fontFamily:"sans-serif",alignItems:"center"}}>
                    <span style={{fontWeight:700,color:C.accent}}>{p.author}</span>
                    <span>·</span><span>{p.date}</span>
                    <span>·</span><span>⏱ {p.readTime} мин</span>
                    <span>·</span><span>👁 {p.views}</span>
                  </div>
                </div>
              ))}
              {/* Side stack */}
              <div style={{display:"flex",flexDirection:"column"}}>
                {allPosts.slice(1,4).map((p,i)=>(
                  <div key={p.id} onClick={()=>openPost(p)} style={{padding:"18px 22px",background:COVER_GRADIENTS[p.cover],cursor:"pointer",flex:1,borderBottom:i<2?`1px solid ${C.ink}`:"none",transition:"opacity 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                      <span style={{fontSize:16}}>{COVER_ICON[p.cover]}</span>
                      <span style={{fontSize:9,color:C.inkFaint,letterSpacing:"0.1em",fontWeight:700,fontFamily:"sans-serif"}}>{p.catLabel.toUpperCase()}</span>
                    </div>
                    <div style={{fontSize:"clamp(13px,1.5vw,16px)",fontWeight:800,color:C.ink,lineHeight:1.3,fontFamily:"Georgia,serif",marginBottom:6}}>{p.title}</div>
                    <div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif"}}>{p.readTime} мин · {p.views}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:36}}>
              {/* Left main */}
              <div>
                {/* Categories */}
                <div style={{marginBottom:36}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18,paddingBottom:10,borderBottom:`2px solid ${C.ink}`}}>
                    <h2 style={{margin:0,fontSize:22,fontWeight:900,fontFamily:"Georgia,serif"}}>Ангиллууд</h2>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                    {CATEGORIES.map(cat=>(
                      <div key={cat.id} onClick={()=>openCat(cat.id)} style={{padding:"16px",background:C.white,border:`1.5px solid ${C.border}`,borderRadius:8,cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=cat.color;e.currentTarget.style.background=C.accentLight;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.white;}}>
                        <div style={{fontSize:26,marginBottom:8}}>{cat.icon}</div>
                        <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:"sans-serif"}}>{cat.label}</div>
                        <div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif",marginTop:4}}>{cat.count} нийтлэл</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline ad */}
                

                {/* Latest posts */}
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18,paddingBottom:10,borderBottom:`2px solid ${C.ink}`}}>
                    <h2 style={{margin:0,fontSize:22,fontWeight:900,fontFamily:"Georgia,serif"}}>Сүүлийн нийтлэлүүд</h2>
                  </div>
                  {allPosts.map((p,i)=>(
                    <div key={p.id}>
                      <div onClick={()=>openPost(p)} style={{display:"flex",gap:18,padding:"20px 0",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.querySelector(".ptitle").style.color=C.accent}
                        onMouseLeave={e=>e.currentTarget.querySelector(".ptitle").style.color=C.ink}>
                        <div style={{width:100,height:80,borderRadius:6,background:COVER_GRADIENTS[p.cover],flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{COVER_ICON[p.cover]}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:8,marginBottom:7,alignItems:"center",flexWrap:"wrap"}}>
                            <span style={{fontSize:10,color:C.white,background:C.accent,padding:"2px 8px",fontWeight:700,letterSpacing:"0.08em",fontFamily:"sans-serif"}}>{p.catLabel.toUpperCase()}</span>
                            <span style={{fontSize:10,color:diffColor(p.difficulty),fontWeight:700,fontFamily:"sans-serif"}}>{p.difficulty}</span>
                          </div>
                          <h3 className="ptitle" style={{margin:"0 0 6px",fontSize:"clamp(14px,1.8vw,17px)",fontWeight:800,lineHeight:1.3,color:C.ink,fontFamily:"Georgia,serif",transition:"color 0.15s"}}>{p.title}</h3>
                          <div style={{fontSize:12,color:C.inkFaint,fontFamily:"sans-serif",display:"flex",gap:10,flexWrap:"wrap"}}>
                            <span style={{fontWeight:600,color:C.accent}}>{p.author}</span>
                            <span>·</span><span>{p.date}</span>
                            <span>·</span><span>⏱ {p.readTime} мин</span>
                            <span>·</span><span>👁 {p.views}</span>
                          </div>
                        </div>
                      </div>
                      {i<allPosts.length-1&&<div style={{height:1,background:C.border}}/>}
                      
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SIDEBAR ── */}
              <aside style={{display:"flex",flexDirection:"column",gap:24}}>
                

                {/* Popular */}
                <div style={{border:`1.5px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",background:C.ink,color:"#fff",fontSize:13,fontWeight:800,fontFamily:"sans-serif",letterSpacing:"0.05em"}}>🔥 ХАМГИЙН ИХ УНШИХ</div>
                  {allPosts.sort((a,b)=>parseFloat(b.views)-parseFloat(a.views)).slice(0,5).map((p,i)=>(
                    <div key={p.id} onClick={()=>openPost(p)} style={{display:"flex",gap:10,padding:"12px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:C.white}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.accentLight}
                      onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                      <div style={{fontSize:22,fontWeight:900,color:C.border,width:28,flexShrink:0,fontFamily:"Georgia,serif",lineHeight:1.2}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:C.ink,lineHeight:1.3,fontFamily:"Georgia,serif"}}>{p.title}</div>
                        <div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif",marginTop:4}}>👁 {p.views}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Newsletter */}
                <div style={{border:`1.5px solid ${C.accent}`,borderRadius:8,padding:"20px",background:C.accentLight}}>
                  <div style={{fontSize:18,marginBottom:8}}>📧</div>
                  <div style={{fontSize:16,fontWeight:800,color:C.ink,marginBottom:8,fontFamily:"Georgia,serif"}}>Долоо хоног бүрийн товхимол</div>
                  <p style={{fontSize:13,color:C.inkLight,margin:"0 0 14px",lineHeight:1.55,fontFamily:"sans-serif"}}>Крипто ертөнцийн чухал ойлголтуудыг энгийн монгол хэлэнд тайлбарлан илгээнэ.</p>
                  {newsletterDone?(
                    <div style={{background:"#fff",border:`1px solid ${C.accent}`,borderRadius:6,padding:"10px",textAlign:"center",fontSize:13,color:C.accent,fontWeight:600,fontFamily:"sans-serif"}}>✅ Амжилттай бүртгэгдлээ!</div>
                  ):(
                    <>
                      <input value={newsletterEmail} onChange={e=>setNewsletterEmail(e.target.value)} placeholder="Таны и-мэйл..."
                        style={{width:"100%",padding:"9px 12px",background:"#fff",border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:13,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box",marginBottom:8}}/>
                      <button onClick={()=>{if(newsletterEmail.includes("@")){setNewsletterDone(true);}}} style={{width:"100%",padding:"10px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"sans-serif"}}>Бүртгүүлэх →</button>
                    </>
                  )}
                </div>

                {/* Quick glossary */}
                <div style={{border:`1.5px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",background:C.bgDark,borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:800,fontFamily:"sans-serif",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>📖 Крипто толь</span>
                    <button onClick={()=>setScreen("glossary")} style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontSize:12,fontFamily:"sans-serif",fontWeight:600}}>Бүгдийг харах →</button>
                  </div>
                  {GLOSSARY.slice(0,5).map((g,i)=>(
                    <div key={g.term} style={{padding:"10px 14px",borderBottom:i<4?`1px solid ${C.border}`:"none",background:C.white}}>
                      <div style={{fontWeight:700,color:C.ink,fontSize:13,fontFamily:"sans-serif"}}>{g.term} <span style={{color:C.accent,fontWeight:600}}>({g.mn})</span></div>
                      <div style={{fontSize:12,color:C.inkLight,fontFamily:"sans-serif",marginTop:3}}>{g.def}</div>
                    </div>
                  ))}
                </div>

                {/* Sponsor */}
                <div style={{border:`1.5px solid #f7931a44`,borderRadius:8,padding:"18px",background:"#fffbf5"}}>
                  <div style={{fontSize:10,color:"#f7931a",letterSpacing:"0.15em",fontWeight:700,fontFamily:"sans-serif",marginBottom:10}}>SPONSORED</div>
                  <div style={{fontSize:15,fontWeight:800,color:C.ink,marginBottom:8,fontFamily:"Georgia,serif"}}>Binance Монгол — Крипто арилжааны #1 платформ</div>
                  <p style={{fontSize:12,color:C.inkLight,margin:"0 0 12px",lineHeight:1.5,fontFamily:"sans-serif"}}>Хамгийн бага шимтгэлтэй. Монгол хэлний дэмжлэгтэй.</p>
                  <button style={{width:"100%",padding:"9px",background:"#f7931a",border:"none",color:"#000",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"sans-serif"}}>Нэгдэх →</button>
                </div>

                
              </aside>
            </div>
          </div>
        )}

        {/* ══ POST ══════════════════════════════════════ */}
        {screen==="post"&&activePost&&(
          <div style={{paddingTop:32}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:40}}>
              <article>
                <button onClick={()=>setScreen("home")} style={{background:"none",border:`1px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
                  ← Буцах
                </button>
                {/* Breadcrumb */}
                <div style={{fontSize:12,color:C.inkFaint,fontFamily:"sans-serif",marginBottom:16,display:"flex",gap:6,alignItems:"center"}}>
                  <span onClick={()=>setScreen("home")} style={{cursor:"pointer",color:C.accent}}>Нүүр</span>
                  <span>›</span>
                  <span onClick={()=>openCat(activePost.cat)} style={{cursor:"pointer",color:C.accent}}>{activePost.catLabel}</span>
                  <span>›</span>
                  <span style={{color:C.inkFaint}}>Нийтлэл</span>
                </div>

                {/* Labels */}
                <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{background:C.accent,color:"#fff",padding:"4px 12px",fontSize:11,fontWeight:700,letterSpacing:"0.08em",fontFamily:"sans-serif"}}>{activePost.catLabel.toUpperCase()}</span>
                  <span style={{fontSize:11,color:diffColor(activePost.difficulty),fontWeight:700,fontFamily:"sans-serif",border:`1px solid ${diffColor(activePost.difficulty)}`,padding:"3px 10px"}}>
                    {activePost.difficulty==="Амархан"?"🟢":"🟡"} {activePost.difficulty}
                  </span>
                  <span style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif"}}>⏱ {activePost.readTime} минут унших</span>
                </div>

                {/* Title */}
                <h1 style={{margin:"0 0 16px",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:900,lineHeight:1.2,color:C.ink,fontFamily:"Georgia,serif",letterSpacing:"-0.5px"}}>{activePost.title}</h1>
                <p style={{margin:"0 0 20px",fontSize:18,color:C.inkLight,lineHeight:1.6,fontFamily:"Georgia,serif",fontStyle:"italic",borderLeft:`4px solid ${C.accent}`,paddingLeft:16}}>{activePost.subtitle}</p>

                {/* Author + meta */}
                <div style={{display:"flex",gap:12,alignItems:"center",padding:"14px 16px",background:C.bgDark,border:`1px solid ${C.border}`,borderRadius:8,marginBottom:24,fontFamily:"sans-serif"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:C.accentLight,border:`2px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:C.accent,flexShrink:0}}>{activePost.author[0]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,color:C.ink,fontSize:14}}>{activePost.author}</div>
                    <div style={{fontSize:12,color:C.inkFaint}}>{activePost.authorTitle}</div>
                  </div>
                  <div style={{fontSize:12,color:C.inkFaint,textAlign:"right"}}>
                    <div>{activePost.date}</div>
                    <div>👁 {activePost.views}</div>
                  </div>
                </div>

                {/* Cover */}
                <div style={{height:280,background:COVER_GRADIENTS[activePost.cover],borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:90,marginBottom:28,border:`1px solid ${C.border}`}}>
                  {COVER_ICON[activePost.cover]}
                </div>

                {/* Intro */}
                <div style={{background:C.accentLight,border:`1px solid ${C.accent}33`,borderRadius:8,padding:"18px 20px",marginBottom:28}}>
                  <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:"0.1em",fontFamily:"sans-serif",marginBottom:8}}>ТОВЧ АГУУЛГА</div>
                  <p style={{margin:0,fontSize:16,color:C.ink,lineHeight:1.7,fontFamily:"sans-serif"}}>{activePost.intro}</p>
                </div>

                {/* Body */}
                <div style={{fontSize:16,lineHeight:1.9,color:"#2a2a20",fontFamily:"Georgia,serif"}}>
                  {activePost.sections.map((s,i)=>(
                    <div key={i} style={{marginBottom:28}}>
                      <h2 style={{margin:"0 0 14px",fontSize:"clamp(18px,2.2vw,24px)",fontWeight:800,color:C.ink,fontFamily:"Georgia,serif",letterSpacing:"-0.3px",paddingBottom:8,borderBottom:`2px solid ${C.accentLight}`}}>{s.title}</h2>
                      {s.body.split("\n\n").map((para,j)=>{
                        if(para.startsWith("•")||para.match(/^\d\./)){
                          return(
                            <ul key={j} style={{paddingLeft:20,margin:"0 0 16px"}}>
                              {para.split("\n").map((line,k)=>(
                                <li key={k} style={{marginBottom:8,color:"#3a3a30",fontFamily:"sans-serif",fontSize:15,lineHeight:1.65}}>
                                  {line.replace(/^[•\d\.]\s*/,"")}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={j} style={{margin:"0 0 16px",fontFamily:"sans-serif",fontSize:15,lineHeight:1.75,color:"#3a3a30"}}>{para}</p>;
                      })}
                      
                    </div>
                  ))}
                </div>

                {/* Key takeaways */}
                <div style={{background:C.ink,color:"#fff",borderRadius:10,padding:"22px 24px",margin:"28px 0"}}>
                  <div style={{fontSize:13,fontWeight:800,letterSpacing:"0.1em",fontFamily:"sans-serif",marginBottom:14,color:"#aaa"}}>💡 ГОЛ САНААНУУД</div>
                  {["Крипто ертөнцөд Private Key л чухал — хэзээ ч хэнд хэлж болохгүй","DYOR (Do Your Own Research) — судлаад оруул, хэнд ч итгэж болохгүй","Дорнод арилжааны стратегигүйгээр оруулахгүй байх нь зүйтэй","Хурдан баяжна гэж найдах нь хамгийн аюултай сэтгэлгээ"].map((t,i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start",fontFamily:"sans-serif",fontSize:14}}>
                      <span style={{color:C.accentBright,flexShrink:0,fontWeight:700}}>✓</span>
                      <span style={{color:"#d8d8d0",lineHeight:1.5}}>{t}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
                  {activePost.tags.map(t=>(
                    <span key={t} style={{padding:"5px 12px",background:C.bgDark,border:`1px solid ${C.borderDark}`,borderRadius:3,fontSize:12,color:C.inkLight,fontFamily:"sans-serif",cursor:"pointer"}}>{t}</span>
                  ))}
                </div>

                {/* Share */}
                <div style={{display:"flex",gap:8,marginBottom:32,fontFamily:"sans-serif"}}>
                  <span style={{fontSize:13,color:C.inkFaint,alignSelf:"center"}}>Хуваалцах:</span>
                  {["Twitter/X","Facebook","Telegram","LinkedIn"].map(s=>(
                    <button key={s} style={{padding:"7px 14px",background:C.white,border:`1.5px solid ${C.borderDark}`,color:C.inkLight,borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"sans-serif"}}>{s}</button>
                  ))}
                </div>

                {/* Related */}
                <div style={{paddingTop:20,borderTop:`2px solid ${C.ink}`}}>
                  <h3 style={{margin:"0 0 18px",fontSize:18,fontWeight:800,fontFamily:"Georgia,serif"}}>Холбогдох нийтлэлүүд</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                    {allPosts.filter(p=>p.id!==activePost.id&&(p.cat===activePost.cat||p.difficulty===activePost.difficulty)).slice(0,4).map(p=>(
                      <div key={p.id} onClick={()=>openPost(p)} style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",cursor:"pointer",background:C.white}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                        <div style={{height:80,background:COVER_GRADIENTS[p.cover],display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{COVER_ICON[p.cover]}</div>
                        <div style={{padding:"12px"}}>
                          <div style={{fontSize:11,color:C.accent,fontWeight:700,fontFamily:"sans-serif",marginBottom:5}}>{p.catLabel.toUpperCase()}</div>
                          <div style={{fontSize:13,fontWeight:700,color:C.ink,lineHeight:1.3,fontFamily:"Georgia,serif"}}>{p.title}</div>
                          <div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif",marginTop:6}}>⏱ {p.readTime} мин</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside style={{display:"flex",flexDirection:"column",gap:20}}>
                
                <div style={{border:`1.5px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",background:C.ink,color:"#fff",fontSize:12,fontWeight:800,fontFamily:"sans-serif"}}>🔥 ХАМГИЙН ИХ УНШИХ</div>
                  {allPosts.sort((a,b)=>parseFloat(b.views)-parseFloat(a.views)).slice(0,5).map((p,i)=>(
                    <div key={p.id} onClick={()=>openPost(p)} style={{display:"flex",gap:10,padding:"11px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:C.white}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.accentLight}
                      onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                      <div style={{fontSize:20,fontWeight:900,color:C.border,width:24,flexShrink:0,fontFamily:"Georgia,serif"}}>{i+1}</div>
                      <div style={{fontSize:12,fontWeight:700,color:C.ink,lineHeight:1.3,fontFamily:"Georgia,serif"}}>{p.title}</div>
                    </div>
                  ))}
                </div>
                <div style={{border:`1.5px solid ${C.accent}`,borderRadius:8,padding:"18px",background:C.accentLight}}>
                  <div style={{fontSize:15,fontWeight:800,color:C.ink,marginBottom:8,fontFamily:"Georgia,serif"}}>📧 Долоо хоног бүр</div>
                  <p style={{fontSize:12,color:C.inkLight,margin:"0 0 12px",fontFamily:"sans-serif"}}>Крипто мэдлэгийг энгийнээр и-мэйлд авах</p>
                  <input placeholder="И-мэйл хаяг..." style={{width:"100%",padding:"9px 12px",background:"#fff",border:`1px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:13,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box",marginBottom:8}}/>
                  <button style={{width:"100%",padding:"9px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"sans-serif"}}>Бүртгүүлэх</button>
                </div>
                
              </aside>
            </div>
          </div>
        )}

        {/* ══ CATEGORY ══════════════════════════════════ */}
        {screen==="category"&&activeCat&&(()=>{
          const cat = CATEGORIES.find(c=>c.id===activeCat);
          return(
            <div style={{paddingTop:32}}>
              <button onClick={()=>setScreen("home")} style={{background:"none",border:`1px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24}}>← Буцах</button>
              <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:28,paddingBottom:20,borderBottom:`2px solid ${C.ink}`}}>
                <div style={{fontSize:48}}>{cat?.icon}</div>
                <div>
                  <h1 style={{margin:"0 0 6px",fontSize:32,fontWeight:900,fontFamily:"Georgia,serif"}}>{cat?.label}</h1>
                  <div style={{fontSize:14,color:C.inkFaint,fontFamily:"sans-serif"}}>{catPosts.length} нийтлэл</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:36}}>
                <div>
                  {catPosts.length===0&&<div style={{color:C.inkFaint,fontFamily:"sans-serif",padding:"40px 0",textAlign:"center"}}>Энэ ангилалд нийтлэл байхгүй байна</div>}
                  {catPosts.map((p,i)=>(
                    <div key={p.id}>
                      <div onClick={()=>openPost(p)} style={{display:"flex",gap:18,padding:"20px 0",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.querySelector(".pt2").style.color=C.accent}
                        onMouseLeave={e=>e.currentTarget.querySelector(".pt2").style.color=C.ink}>
                        <div style={{width:120,height:90,borderRadius:8,background:COVER_GRADIENTS[p.cover],flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>{COVER_ICON[p.cover]}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                            <span style={{fontSize:10,color:diffColor(p.difficulty),fontWeight:700,fontFamily:"sans-serif"}}>{p.difficulty}</span>
                            <span style={{fontSize:10,color:C.inkFaint,fontFamily:"sans-serif"}}>⏱ {p.readTime} мин</span>
                          </div>
                          <h3 className="pt2" style={{margin:"0 0 8px",fontSize:"clamp(15px,2vw,19px)",fontWeight:800,lineHeight:1.3,color:C.ink,fontFamily:"Georgia,serif",transition:"color 0.15s"}}>{p.title}</h3>
                          <p style={{margin:"0 0 10px",fontSize:13,color:C.inkLight,lineHeight:1.55,fontFamily:"sans-serif"}}>{p.intro}</p>
                          <div style={{fontSize:12,color:C.inkFaint,fontFamily:"sans-serif"}}>{p.author} · {p.date} · 👁 {p.views}</div>
                        </div>
                      </div>
                      {i<catPosts.length-1&&<div style={{height:1,background:C.border}}/>}
                    </div>
                  ))}
                </div>
                <aside style={{display:"flex",flexDirection:"column",gap:20}}>
                  
                  <div style={{border:`1.5px solid ${C.border}`,borderRadius:8,padding:"18px"}}>
                    <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:800,fontFamily:"Georgia,serif"}}>Бусад ангиллууд</h3>
                    {CATEGORIES.filter(c=>c.id!==activeCat).map(c=>(
                      <div key={c.id} onClick={()=>openCat(c.id)} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer",alignItems:"center"}}>
                        <span style={{fontSize:18}}>{c.icon}</span>
                        <span style={{flex:1,fontSize:13,fontFamily:"sans-serif",color:C.ink,fontWeight:600}}>{c.label}</span>
                        <span style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif"}}>{c.count}</span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          );
        })()}

        {/* ══ GLOSSARY ══════════════════════════════════ */}
        {screen==="glossary"&&(
          <div style={{paddingTop:32,paddingBottom:48}}>
            <div style={{maxWidth:800,margin:"0 auto"}}>
              <div style={{marginBottom:28,paddingBottom:20,borderBottom:`2px solid ${C.ink}`}}>
                <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>📖 Крипто толь бичиг</h1>
                <p style={{margin:"0 0 16px",color:C.inkLight,fontSize:16,fontFamily:"sans-serif"}}>Крипто ертөнцийн {GLOSSARY.length} чухал нэр томьёоны монгол тайлбар</p>
                <input value={glossaryQ} onChange={e=>setGlossaryQ(e.target.value)} placeholder="Нэр томьёо хайх..."
                  style={{width:"100%",padding:"11px 16px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:8,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {filtered_glossary.map(g=>(
                  <div key={g.term} style={{padding:"16px 18px",background:C.white,border:`1.5px solid ${C.border}`,borderRadius:8,transition:"border-color 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{fontWeight:800,color:C.ink,fontSize:15,fontFamily:"sans-serif"}}>{g.term}</div>
                    <div style={{fontSize:12,color:C.accent,fontWeight:600,fontFamily:"sans-serif",marginBottom:6}}>{g.mn}</div>
                    <div style={{fontSize:13,color:C.inkLight,fontFamily:"sans-serif",lineHeight:1.5}}>{g.def}</div>
                  </div>
                ))}
              </div>
              
            </div>
          </div>
        )}

        {/* ══ NEWS PAGE ══════════════════════════════════ */}
        {screen==="news"&&(
          <div style={{paddingTop:32,paddingBottom:48}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:24,paddingBottom:14,borderBottom:`2px solid ${C.ink}`}}>
              <div>
                <h1 style={{margin:"0 0 4px",fontSize:32,fontWeight:900,fontFamily:"Georgia,serif"}}>📰 Сүүлийн мэдээ</h1>
                <div style={{fontSize:13,color:C.inkFaint,fontFamily:"sans-serif"}}>{allPosts.length} нийтлэл · Өнөөдөр {new Date().toLocaleDateString("mn-MN")}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:36}}>
              <div>
                {[...allPosts].sort((a,b)=>b.date.localeCompare(a.date)).map((p,i)=>(
                  <div key={p.id}>
                    <div onClick={()=>openPost(p)} style={{display:"flex",gap:18,padding:"20px 0",cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.querySelector(".nt").style.color=C.accent}
                      onMouseLeave={e=>e.currentTarget.querySelector(".nt").style.color=C.ink}>
                      <div style={{width:110,height:82,borderRadius:8,background:COVER_GRADIENTS[p.cover]||COVER_GRADIENTS.btc,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{COVER_ICON[p.cover]||"📰"}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,marginBottom:7,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontSize:10,color:C.white,background:C.accent,padding:"2px 8px",fontWeight:700,fontFamily:"sans-serif"}}>{p.catLabel?.toUpperCase()}</span>
                          <span style={{fontSize:10,color:C.inkFaint,fontFamily:"sans-serif"}}>⏱ {p.readTime} мин</span>
                          <span style={{fontSize:10,color:C.inkFaint,fontFamily:"sans-serif"}}>📅 {p.date}</span>
                          {p.views==="0"&&<span style={{fontSize:10,background:"#fef9c3",color:"#854d0e",padding:"2px 7px",fontWeight:700,fontFamily:"sans-serif",borderRadius:3}}>ШИНЭ</span>}
                        </div>
                        <h3 className="nt" style={{margin:"0 0 6px",fontSize:"clamp(14px,1.8vw,17px)",fontWeight:800,lineHeight:1.3,color:C.ink,fontFamily:"Georgia,serif",transition:"color 0.15s"}}>{p.title}</h3>
                        <p style={{margin:"0 0 8px",fontSize:13,color:C.inkLight,lineHeight:1.5,fontFamily:"sans-serif"}}>{p.intro?.slice(0,120)}...</p>
                        <div style={{fontSize:12,color:C.inkFaint,fontFamily:"sans-serif"}}>{p.author} · {p.date}</div>
                      </div>
                    </div>
                    {i<allPosts.length-1&&<div style={{height:1,background:C.border}}/>}
                  </div>
                ))}
              </div>
              <aside style={{display:"flex",flexDirection:"column",gap:20}}>
                <div style={{border:`1.5px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",background:C.ink,color:"#fff",fontSize:12,fontWeight:800,fontFamily:"sans-serif"}}>🔥 ХАМГИЙН ИХ УНШИХ</div>
                  {[...allPosts].sort((a,b)=>parseFloat(b.views)-parseFloat(a.views)).slice(0,5).map((p,i)=>(
                    <div key={p.id} onClick={()=>openPost(p)} style={{display:"flex",gap:10,padding:"11px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:C.white}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.accentLight}
                      onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                      <div style={{fontSize:20,fontWeight:900,color:C.border,width:24,flexShrink:0,fontFamily:"Georgia,serif"}}>{i+1}</div>
                      <div style={{fontSize:12,fontWeight:700,color:C.ink,lineHeight:1.3,fontFamily:"Georgia,serif"}}>{p.title}</div>
                    </div>
                  ))}
                </div>
                <div style={{border:`1.5px solid ${C.accent}`,borderRadius:8,padding:"18px",background:C.accentLight}}>
                  <div style={{fontSize:14,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:8}}>📖 Крипто сурах</div>
                  <p style={{fontSize:12,color:C.inkLight,margin:"0 0 12px",fontFamily:"sans-serif"}}>Эхлэгчдэд зориулсан бүрэн гарын авлага</p>
                  <button onClick={()=>openCat("beginner")} style={{width:"100%",padding:"9px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"sans-serif"}}>Үзэх →</button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {/* ══ ADMIN PANEL ════════════════════════════════ */}
        {screen==="admin"&&(
          <div style={{paddingTop:32,paddingBottom:48,maxWidth:800,margin:"0 auto"}}>
            <button onClick={()=>setScreen("home")} style={{background:"none",border:`1px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24}}>← Буцах</button>
            <h1 style={{margin:"0 0 6px",fontSize:32,fontWeight:900,fontFamily:"Georgia,serif"}}>✍️ Мэдээ нэмэх</h1>
            <p style={{fontSize:13,color:C.inkFaint,fontFamily:"sans-serif",marginBottom:24}}>CoinDesk эсвэл бусад эх сурвалжаас мэдээ уншаад монголоор бичнэ үү</p>

            {!adminAuth?(
              <div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"32px",maxWidth:400,margin:"0 auto",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:16}}>🔐</div>
                <div style={{fontSize:16,fontWeight:700,fontFamily:"Georgia,serif",marginBottom:16}}>Нэвтрэх</div>
                <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)}
                  placeholder="Нууц үг..." onKeyDown={e=>e.key==="Enter"&&setAdminAuth(adminPass==="crypto2026")}
                  style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box",marginBottom:12}}/>
                <button onClick={()=>setAdminAuth(adminPass==="crypto2026")}
                  style={{width:"100%",padding:"11px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"sans-serif"}}>Нэвтрэх</button>
                {adminPass&&!adminAuth&&<div style={{color:C.red,fontSize:12,fontFamily:"sans-serif",marginTop:8}}>Нууц үг буруу байна</div>}
              </div>
            ):(
              <div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"28px"}}>
                {adminSaved&&(
                  <div style={{background:"#f0fdf4",border:`1px solid ${C.accent}`,borderRadius:8,padding:"12px 16px",marginBottom:20,fontSize:14,color:C.accent,fontWeight:600,fontFamily:"sans-serif"}}>
                    ✅ Мэдээ амжилттай нэмэгдлээ! "Сүүлийн мэдээ" хэсэгт харагдана.
                  </div>
                )}
                <div style={{display:"grid",gap:16}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Гарчиг *</div>
                    <input value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))}
                      placeholder="Жишээ: Bitcoin $100,000 давлаа — юу болох вэ?"
                      style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Дэд гарчиг</div>
                    <input value={newPost.subtitle} onChange={e=>setNewPost(p=>({...p,subtitle:e.target.value}))}
                      placeholder="Товч тайлбар..."
                      style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Ангилал</div>
                      <select value={newPost.cat} onChange={e=>setNewPost(p=>({...p,cat:e.target.value}))}
                        style={{width:"100%",padding:"10px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:13,outline:"none",fontFamily:"sans-serif"}}>
                        {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Хүндрэл</div>
                      <select value={newPost.difficulty} onChange={e=>setNewPost(p=>({...p,difficulty:e.target.value}))}
                        style={{width:"100%",padding:"10px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:13,outline:"none",fontFamily:"sans-serif"}}>
                        <option>Амархан</option><option>Дунд</option><option>Хэцүү</option>
                      </select>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Унших хугацаа (мин)</div>
                      <input type="number" value={newPost.readTime} onChange={e=>setNewPost(p=>({...p,readTime:e.target.value}))}
                        style={{width:"100%",padding:"10px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:13,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Товч агуулга * (нүүр хуудсанд харагдана)</div>
                    <textarea value={newPost.intro} onChange={e=>setNewPost(p=>({...p,intro:e.target.value}))}
                      placeholder="2-3 өгүүлбэрт мэдээний гол санааг бич..."
                      rows={3} style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box",resize:"vertical"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Дэлгэрэнгүй агуулга * (нийтлэлийн бие)</div>
                    <div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif",marginBottom:6}}>CoinDesk-ийн мэдээг өөрийн үгээр монголоор бичнэ үү</div>
                    <textarea value={newPost.body} onChange={e=>setNewPost(p=>({...p,body:e.target.value}))}
                      placeholder="Мэдээний дэлгэрэнгүй агуулга энд бичнэ..."
                      rows={10} style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box",resize:"vertical"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Таг (таслалаар тусгаарлана)</div>
                    <input value={newPost.tags} onChange={e=>setNewPost(p=>({...p,tags:e.target.value}))}
                      placeholder="Bitcoin, Үнэ, 2026"
                      style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
                  </div>
                  <button onClick={handleAddPost}
                    style={{padding:"14px",background:(!newPost.title||!newPost.intro||!newPost.body)?C.borderDark:C.accent,border:"none",color:"#fff",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:16,fontFamily:"sans-serif",transition:"background 0.2s"}}>
                    ✅ Нийтлэх
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ABOUT ══════════════════════════════════════ */}
        {screen==="about"&&(
          <div style={{paddingTop:32,paddingBottom:48,maxWidth:780,margin:"0 auto"}}>
            <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>Бидний тухай</h1>
            <div style={{height:3,width:60,background:C.accent,marginBottom:28}}/>
            <p style={{fontSize:17,color:C.inkLight,lineHeight:1.8,fontFamily:"sans-serif",marginBottom:24}}>
              <strong style={{color:C.ink}}>Крипто Тайлбарлагч</strong> бол 2025 онд үүссэн Монголын хамгийн том крипто мэдлэгийн блог платформ юм. Бидний зорилго — крипто ертөнцийг монгол хүнд ойлгомжтойгоор тайлбарлах.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32}}>
              {[["50,000+","Сарын унших"],["30+","Нийтлэл"],["4","Мэргэжилтэн"]].map(([v,l])=>(
                <div key={l} style={{padding:"20px",background:C.accentLight,border:`1.5px solid ${C.accent}33`,borderRadius:8,textAlign:"center"}}>
                  <div style={{fontSize:28,fontWeight:900,color:C.accent,fontFamily:"Georgia,serif"}}>{v}</div>
                  <div style={{fontSize:13,color:C.inkLight,fontFamily:"sans-serif",marginTop:4}}>{l}</div>
                </div>
              ))}
            </div>
            <h2 style={{fontSize:22,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:16}}>Авторууд</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
              {[{n:"Б.Мөнхбаяр",t:"Крипто судлаач",d:"Блокчейн технологийг 2017 оноос судалж байна. Bitcoin болон Ethereum-ийн техникийн шинжилгээнд мэргэшсэн."},
                {n:"Д.Сарнай",t:"Блокчейн хөгжүүлэгч",d:"Smart Contract болон DeFi protocol-ийн хөгжүүлэгч. Solidity, Rust хэлнүүдэд мэргэшсэн."},
                {n:"Н.Болдбаатар",t:"DeFi судлаач",d:"Decentralized Finance, yield farming болон liquidity protocol судлаач."},
                {n:"Г.Цэрэнпунцаг",t:"Санхүүгийн зөвлөх",d:"Монголын крипто татвар, хууль эрх зүйн асуудлаар мэргэшсэн санхүүч."},
              ].map(a=>(
                <div key={a.n} style={{display:"flex",gap:14,padding:"18px",background:C.white,border:`1px solid ${C.border}`,borderRadius:8}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:C.accentLight,border:`2px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.accent,flexShrink:0}}>{a.n[0]}</div>
                  <div><div style={{fontWeight:700,color:C.ink,fontFamily:"sans-serif"}}>{a.n}</div><div style={{fontSize:12,color:C.accent,fontFamily:"sans-serif",marginBottom:6}}>{a.t}</div><div style={{fontSize:12,color:C.inkLight,fontFamily:"sans-serif",lineHeight:1.5}}>{a.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ══ CONTACT ══════════════════════════════════════ */}
      {screen==="contact"&&(
        <div style={{paddingTop:32,paddingBottom:48,maxWidth:700,margin:"0 auto"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:`1px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24}}>← Буцах</button>
          <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>Холбоо барих</h1>
          <div style={{height:3,width:60,background:C.accent,marginBottom:28}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
            {[{icon:"📧",title:"И-мэйл",val:"info@cryptotailbar.mn",sub:"24 цагийн дотор хариулна"},
              {icon:"📱",title:"Telegram",val:"@cryptotailbar",sub:"Хурдан холбоо барих"},
              {icon:"📍",title:"Хаяг",val:"Улаанбаатар, Монгол",sub:"Сүхбаатар дүүрэг"},
              {icon:"🕐",title:"Ажлын цаг",val:"Да-Ба: 09:00-18:00",sub:"Монгол цагаар"},
            ].map(i=>(
              <div key={i.title} style={{padding:"20px",background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10}}>
                <div style={{fontSize:28,marginBottom:10}}>{i.icon}</div>
                <div style={{fontWeight:700,color:C.ink,fontFamily:"sans-serif",marginBottom:4}}>{i.title}</div>
                <div style={{fontSize:14,color:C.accent,fontFamily:"sans-serif",fontWeight:600,marginBottom:3}}>{i.val}</div>
                <div style={{fontSize:12,color:C.inkFaint,fontFamily:"sans-serif"}}>{i.sub}</div>
              </div>
            ))}
          </div>
          <div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"28px"}}>
            <h2 style={{margin:"0 0 20px",fontSize:20,fontWeight:800,fontFamily:"Georgia,serif"}}>Мессеж илгээх</h2>
            {[["Таны нэр","Нэрээ оруулна уу..."],["И-мэйл хаяг","email@example.com"],["Сэдэв","Ямар асуудлаар холбогдож байна вэ?"]].map(([l,p])=>(
              <div key={l} style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>{l}</div>
                <input placeholder={p} style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Мессеж</div>
              <textarea placeholder="Дэлгэрэнгүй бичнэ үү..." rows={5} style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box",resize:"vertical"}}/>
            </div>
            <button style={{width:"100%",padding:"12px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:15,fontFamily:"sans-serif"}}>Илгээх →</button>
          </div>
        </div>
      )}

      {/* ══ WRITER ════════════════════════════════════════ */}
      {screen==="writer"&&(
        <div style={{paddingTop:32,paddingBottom:48,maxWidth:780,margin:"0 auto"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:`1px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24}}>← Буцах</button>
          <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>Нийтлэгч болох</h1>
          <div style={{height:3,width:60,background:C.accent,marginBottom:20}}/>
          <p style={{fontSize:16,color:C.inkLight,lineHeight:1.8,fontFamily:"sans-serif",marginBottom:28}}>
            Крипто, блокчейн, Web3 чиглэлээр монгол хэлэнд мэдлэгтэй бол манай командтай нэгдэж нийтлэл бичих боломжтой.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:32}}>
            {[{icon:"✍️",t:"Чөлөөт нийтлэгч",d:"Нийтлэл тутмаас орлого авна"},
              {icon:"📅",t:"Байнгын нийтлэгч",d:"Сар бүр тогтмол орлого"},
              {icon:"⭐",t:"Гол редактор",d:"Бүтэн цагийн ажлын байр"},
            ].map(i=>(
              <div key={i.t} style={{padding:"20px",background:C.accentLight,border:`1.5px solid ${C.accent}33`,borderRadius:10,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:10}}>{i.icon}</div>
                <div style={{fontWeight:700,color:C.ink,fontSize:14,fontFamily:"sans-serif",marginBottom:6}}>{i.t}</div>
                <div style={{fontSize:12,color:C.inkLight,fontFamily:"sans-serif"}}>{i.d}</div>
              </div>
            ))}
          </div>
          <div style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"28px"}}>
            <h2 style={{margin:"0 0 6px",fontSize:20,fontWeight:800,fontFamily:"Georgia,serif"}}>Өргөдөл гаргах</h2>
            <p style={{margin:"0 0 20px",fontSize:13,color:C.inkFaint,fontFamily:"sans-serif"}}>Бидэнтэй холбогдоход 3-5 ажлын өдрийн дотор хариу өгнө.</p>
            {[["Нэр","Таны бүтэн нэр"],["И-мэйл","email@example.com"],["Telegram","@username"]].map(([l,p])=>(
              <div key={l} style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>{l}</div>
                <input placeholder={p} style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Крипто чиглэлийн мэдлэгийн түвшин</div>
              <select style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif"}}>
                <option>Эхлэгч (6 сар хүртэл)</option>
                <option>Дунд (1-3 жил)</option>
                <option>Мэргэжилтэн (3+ жил)</option>
              </select>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:6,fontFamily:"sans-serif"}}>Бичсэн нийтлэлийн жишээ (холбоос)</div>
              <input placeholder="https://..." style={{width:"100%",padding:"10px 14px",background:C.bg,border:`1.5px solid ${C.borderDark}`,borderRadius:6,color:C.ink,fontSize:14,outline:"none",fontFamily:"sans-serif",boxSizing:"border-box"}}/>
            </div>
            <button style={{width:"100%",padding:"12px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:15,fontFamily:"sans-serif"}}>Өргөдөл илгээх →</button>
          </div>
        </div>
      )}

      {/* ══ ADVERTISE ═════════════════════════════════════ */}
      {screen==="advertise"&&(
        <div style={{paddingTop:32,paddingBottom:48,maxWidth:860,margin:"0 auto"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:`1px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24}}>← Буцах</button>
          <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>Advertise — Зар сурталчилгаа</h1>
          <div style={{height:3,width:60,background:C.accent,marginBottom:20}}/>
          <p style={{fontSize:16,color:C.inkLight,lineHeight:1.8,fontFamily:"sans-serif",marginBottom:32}}>
            Монголын крипто болон санхүүгийн сонирхолтой залуучуудад хүрэх хамгийн шууд арга. Сар бүр <strong style={{color:C.ink}}>50,000+</strong> зочинтой.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
            {[
              {name:"Banner зар",size:"728×90 px",place:"Header доор",price:"$50/сар",hot:false},
              {name:"Sidebar зар",size:"300×250 px",place:"Нийтлэлийн хажуу",price:"$80/сар",hot:true},
              {name:"Sponsored нийтлэл",size:"Бүтэн хуудас",place:"Нүүр хуудсанд",price:"$150/нийтлэл",hot:true},
              {name:"Newsletter зар",size:"600×200 px",place:"7 хоног бүрийн имэйл",price:"$40/удаа",hot:false},
            ].map(p=>(
              <div key={p.name} style={{padding:"22px",background:C.white,border:`1.5px solid ${p.hot?C.accent:C.border}`,borderRadius:10,position:"relative"}}>
                {p.hot&&<div style={{position:"absolute",top:12,right:12,background:C.accent,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:3,fontFamily:"sans-serif"}}>ЭРЭЛТТЭЙ</div>}
                <div style={{fontWeight:800,fontSize:17,color:C.ink,fontFamily:"Georgia,serif",marginBottom:8}}>{p.name}</div>
                <div style={{fontSize:13,color:C.inkFaint,fontFamily:"sans-serif",marginBottom:4}}>Хэмжээ: {p.size}</div>
                <div style={{fontSize:13,color:C.inkFaint,fontFamily:"sans-serif",marginBottom:12}}>Байрлал: {p.place}</div>
                <div style={{fontSize:22,fontWeight:900,color:C.accent,fontFamily:"Georgia,serif"}}>{p.price}</div>
              </div>
            ))}
          </div>
          <div style={{background:C.ink,color:"#fff",borderRadius:10,padding:"28px",textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:20,fontWeight:800,fontFamily:"Georgia,serif",marginBottom:8}}>Захиалга өгөх</div>
            <p style={{fontSize:14,color:"#888",margin:"0 0 16px",fontFamily:"sans-serif"}}>Telegram эсвэл и-мэйлээр холбогдоорой</p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" style={{padding:"11px 24px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"sans-serif",textDecoration:"none"}}>📱 Telegram-аар</a>
              <a href="mailto:ads@cryptotailbar.mn" style={{padding:"11px 24px",background:"#2a2a2a",border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"sans-serif",textDecoration:"none"}}>📧 И-мэйлээр</a>
            </div>
          </div>
        </div>
      )}

      {/* ══ PRIVACY ═══════════════════════════════════════ */}
      {screen==="privacy"&&(
        <div style={{paddingTop:32,paddingBottom:48,maxWidth:780,margin:"0 auto"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:`1px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24}}>← Буцах</button>
          <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>Нууцлалын бодлого</h1>
          <div style={{height:3,width:60,background:C.accent,marginBottom:8}}/>
          <div style={{fontSize:12,color:C.inkFaint,fontFamily:"sans-serif",marginBottom:28}}>Сүүлд шинэчилсэн: 2026 оны 3 дугаар сар</div>
          {[
            {t:"1. Цуглуулдаг мэдээлэл",b:"Бид newsletter-т бүртгүүлэх үед и-мэйл хаягийг цуглуулна. Вебсайт ашиглалтын статистик мэдээллийг (зочны тоо, хуудасны үзэлт) нэрийгүй хэлбэрээр Google Analytics-аар цуглуулна."},
            {t:"2. Мэдээллийг хэрхэн ашигладаг вэ",b:"Цуглуулсан мэдээллийг зөвхөн newsletter илгээх болон сайтын агуулгыг сайжруулах зорилгоор ашиглана. Таны мэдээллийг гуравдагч этгээдэд зардаггүй."},
            {t:"3. Cookie (Күүки)",b:"Бид Google Analytics болон зарын системийн зорилгоор күүки ашигладаг. Та хөтчийнхөө тохиргооноос күүкийг идэвхгүй болгох боломжтой."},
            {t:"4. Гуравдагч этгээдийн холбоосууд",b:"Бидний сайт дахь affiliate болон sponsor холбоосууд гуравдагч сайт руу орох боломж олгодог. Тэдгээр сайтын нууцлалын бодлогод бид хариуцлага хүлээхгүй."},
            {t:"5. Хүүхдийн нууцлал",b:"Бидний сайт 18 нас хүрсэн хүмүүст зориулагдсан. Бид 18-аас доош насны хүмүүсийн мэдээллийг санаатайгаар цуглуулдаггүй."},
            {t:"6. Холбоо барих",b:"Нууцлалтай холбоотой асуулт байвал info@cryptotailbar.mn хаягаар бидэнтэй холбогдоно уу."},
          ].map((s,i)=>(
            <div key={i} style={{marginBottom:24,padding:"20px",background:C.white,border:`1px solid ${C.border}`,borderRadius:8}}>
              <h2 style={{margin:"0 0 10px",fontSize:17,fontWeight:800,color:C.ink,fontFamily:"Georgia,serif"}}>{s.t}</h2>
              <p style={{margin:0,fontSize:14,color:C.inkLight,lineHeight:1.75,fontFamily:"sans-serif"}}>{s.b}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{background:C.ink,color:"#aaa",marginTop:48,padding:"40px 24px 20px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:32,marginBottom:32}}>
            <div>
              <div style={{fontSize:26,fontWeight:900,fontFamily:"Georgia,serif",marginBottom:12}}>
                <span style={{color:"#fff"}}>Крипто</span><span style={{color:C.accentBright}}>Тайлбарлагч</span>
              </div>
              <p style={{fontSize:13,lineHeight:1.7,color:"#666",margin:"0 0 16px"}}>Монголын хамгийн найдвартай крипто мэдлэгийн эх сурвалж. Энгийн хэлэнд ойлгомжтой тайлбар.</p>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                {[["Telegram","https://t.me/"],["Twitter","https://twitter.com/"],["Facebook","https://facebook.com/"],["YouTube","https://youtube.com/"]].map(([s,url])=>(
                  <a key={s} href={url} target="_blank" rel="noopener noreferrer"
                    style={{width:32,height:32,borderRadius:"50%",background:"#2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,textDecoration:"none",color:"#888",transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.accent;e.currentTarget.style.color="#fff";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#2a2a2a";e.currentTarget.style.color="#888";}}>
                    {s[0]}
                  </a>
                ))}
              </div>
              <div style={{fontSize:11,color:"#444"}}>© 2026 КрыптоТайлбарлагч. Бүх эрх хамгаалагдсан.</div>
            </div>

            {/* Агуулга */}
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:C.accentBright,marginBottom:14}}>АГУУЛГА</div>
              {[["beginner","Эхлэгчдэд"],["bitcoin","Bitcoin"],["ethereum","Ethereum"],["defi","DeFi"],["nft","NFT & Web3"]].map(([id,label])=>(
                <div key={id} onClick={()=>openCat(id)} style={{fontSize:13,color:"#555",marginBottom:8,cursor:"pointer",transition:"color 0.15s"}}
                  onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="#555"}>{label}</div>
              ))}
            </div>

            {/* Платформ */}
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:C.accentBright,marginBottom:14}}>ПЛАТФОРМ</div>
              {[["about","Бидний тухай"],["writer","Нийтлэгч болох"],["advertise","Advertise"],["privacy","Нууцлал"],["contact","Холбоо барих"]].map(([id,label])=>(
                <div key={id} onClick={()=>setScreen(id)} style={{fontSize:13,color:"#555",marginBottom:8,cursor:"pointer",transition:"color 0.15s"}}
                  onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="#555"}>{label}</div>
              ))}
            </div>

            {/* Нийгэмлэг */}
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:C.accentBright,marginBottom:14}}>НИЙГЭМЛЭГ</div>
              {[["https://t.me/","Telegram 📱"],["https://twitter.com/","Twitter/X 🐦"],["https://facebook.com/","Facebook 👥"],["https://youtube.com/","YouTube ▶️"],["https://discord.com/","Discord 💬"]].map(([url,label])=>(
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  style={{display:"block",fontSize:13,color:"#555",marginBottom:8,cursor:"pointer",textDecoration:"none",transition:"color 0.15s"}}
                  onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="#555"}>{label}</a>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid #1e1e1e",paddingTop:16,fontSize:11,color:"#333",textAlign:"center"}}>
            Энэхүү сайт дах агуулга нь санхүүгийн зөвлөгөө биш. Крипто хөрөнгө оруулалт нь эрсдэлтэй. Мэргэжилтэнтэй зөвлөлдөөрэй.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fi{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        input:focus{border-color:#0a7c4e !important;box-shadow:0 0 0 3px rgba(10,124,78,0.1)}
        ::selection{background:#e8f5ef;color:#0a7c4e}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#d0d0c4;border-radius:3px}
      `}</style>
    </div>
  );
}