'use client';
import { useState, useEffect } from "react";
import IconButton from "../components/IconButton";
import { urlFor } from '../lib/sanity'; 

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

const POSTS_FALLBACK = [
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
  }
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

const COVER_IMAGES = {
  btc: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1000",
  wallet: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=1000",
  defi: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000",
  eth: "https://images.unsplash.com/photo-1622790698141-94e30457ef12?auto=format&fit=crop&q=80&w=1000",
  law: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1000",
  staking: "https://images.unsplash.com/photo-1640344583441-73988739688e?auto=format&fit=crop&q=80&w=1000",
  mining: "https://images.unsplash.com/photo-1644143379190-08a5f0556396?auto=format&fit=crop&q=80&w=1000",
  nft: "https://images.unsplash.com/photo-1643101809754-43a91784ebec?auto=format&fit=crop&q=80&w=1000",
};
const COVER_ICON = { btc:"₿", wallet:"👛", defi:"🏦", eth:"Ξ", law:"⚖️", staking:"🌱", mining:"⛏", nft:"🖼" };

function diffColor(d){ return d==="Амархан"?C.accent:d==="Дунд"?C.gold:C.red; }

export default function CryptoTailbarClient({ initialPosts = [] }) {
  const [screen, setScreen] = useState("home"); 
  const [activePost, setActivePost] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [glossaryQ, setGlossaryQ] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [allPosts, setAllPosts] = useState(initialPosts.length > 0 ? initialPosts : POSTS_FALLBACK);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function openPost(p){ setActivePost(p); setScreen("post"); window.scrollTo(0,0); }
  function openCat(id){ setActiveCat(id); setScreen("category"); window.scrollTo(0,0); }

  const catPosts = activeCat ? allPosts.filter(p=>p.cat===activeCat) : [];
  const searchResults = searchQ.length>1 ? allPosts.filter(p=>p.title.toLowerCase().includes(searchQ.toLowerCase())||(p.tags&&p.tags.some(t=>t.toLowerCase().includes(searchQ.toLowerCase())))) : [];
  const filtered_glossary = glossaryQ ? GLOSSARY.filter(g=>g.term.toLowerCase().includes(glossaryQ.toLowerCase())||g.mn.includes(glossaryQ)) : GLOSSARY;

  if (!mounted) return <div style={{minHeight:"100vh", background:C.bg}} />;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:"'Georgia','Times New Roman',serif"}}>
      {/* HEADER */}
      <header style={{background:C.white,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:200, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'}}>
        <div className="container-wide mobile-stack" style={{background:C.ink,padding:"6px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:16,fontSize:11,color:"#aaa",letterSpacing:"0.05em", flexWrap: "wrap"}}>
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
        <div className="container-wide mobile-stack" style={{padding:"18px 24px",display:"flex",alignItems:"center",gap:20}}>
          <div onClick={()=>setScreen("home")} style={{cursor:"pointer",flex:1}}>
            <div style={{display:"flex",alignItems:"baseline",gap:3}}>
              <span style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:900,letterSpacing:"-2px",color:C.ink,lineHeight:1,fontFamily:"Georgia,serif"}}>Крипто</span>
              <span style={{fontSize:"clamp(26px,3.5vw,42px)",fontWeight:900,letterSpacing:"-2px",color:C.accent,lineHeight:1,fontFamily:"Georgia,serif"}}>Тайлбарлагч</span>
            </div>
            <div style={{fontSize:11,color:C.inkFaint,letterSpacing:"0.15em",marginTop:2,fontFamily:"sans-serif",fontWeight:400}}>МОНГОЛ ХЭЛЭН ДЭХ КРИПТО МЭДЛЭГ</div>
          </div>
          <div className="mobile-hide" style={{flex:2}}/>
          <div style={{display:"flex",gap:8}}>
            <IconButton onClick={()=>setSearchOpen(o=>!o)} style={{background:"none",border:`1.5px solid ${C.borderDark}`,color:C.inkLight,padding:"8px 13px",borderRadius:6,cursor:"pointer",fontSize:14,fontFamily:"sans-serif"}}>🔍</IconButton>
          </div>
        </div>
        <nav style={{borderTop:`1px solid ${C.border}`,background:C.white}}>
          <div className="container-wide" style={{padding:"0 24px",display:"flex",overflowX:"auto"}}>
            {[["home","Нүүр"],["glossary","Толь бичиг"],["about","Бидний тухай"]].concat(CATEGORIES.slice(0,5).map(c=>[c.id,c.label])).map(([id,label])=>(
              <IconButton key={id} onClick={()=>id==="home"?setScreen("home"):id==="glossary"||id==="about"?setScreen(id):openCat(id)}
                style={{background:"none",border:"none",borderBottom:`2.5px solid ${(screen===id||(screen==="category"&&activeCat===id))?"#1a1a14":"transparent"}`,color:(screen===id||(screen==="category"&&activeCat===id))?C.ink:C.inkLight,padding:"11px 16px",cursor:"pointer",fontFamily:"sans-serif",fontSize:13,fontWeight:(screen===id||(screen==="category"&&activeCat===id))?700:400,whiteSpace:"nowrap",transition:"color 0.15s"}}>
                {label}
              </IconButton>
            ))}
          </div>
        </nav>
        {searchOpen&&(
          <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 24px"}}>
            <div className="container-wide">
              <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Нийтлэл хайх..."
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
            </div>
          </div>
        )}
      </header>

      <div className="container-wide">
        {screen==="home"&&(
          <div style={{paddingTop:36}}>
            <div key="hero-section" className="hero-grid" style={{marginBottom:36,border:`1.5px solid ${C.ink}`,borderRadius:4,overflow:"hidden"}}>
              {allPosts.slice(0,1).map(p=>(
                <div key={p.id} onClick={()=>openPost(p)} className="image-container" style={{cursor:"pointer",padding:"32px 36px",position:"relative",borderRight:`1px solid ${C.ink}`, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
                  <img src={COVER_IMAGES[p.cover] || COVER_IMAGES.btc} alt={p.title} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0}} />
                  <div className="gradient-overlay" style={{zIndex:1}} />
                  <div style={{position:'relative', zIndex:2}}>
                    <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                      <span style={{background:C.ink,color:"#fff",padding:"3px 10px",fontSize:10,fontWeight:800,letterSpacing:"0.1em",fontFamily:"sans-serif"}}>ОНЦЛОХ</span>
                      <span style={{background:C.accent,color:"#fff",padding:"3px 10px",fontSize:10,fontWeight:700,fontFamily:"sans-serif"}}>{(p.catLabel||"").toUpperCase()}</span>
                      <span style={{fontSize:10,color:diffColor(p.difficulty),fontWeight:700,fontFamily:"sans-serif",background:"rgba(255,255,255,0.7)",padding:"3px 8px",borderRadius:3}}>{p.difficulty}</span>
                    </div>
                    <h1 style={{margin:"0 0 14px",fontSize:"clamp(20px,2.5vw,32px)",fontWeight:900,lineHeight:1.2,color:"#fff",fontFamily:"Georgia,serif", textShadow: "1px 1px 2px rgba(0,0,0,0.8)"}}>{p.title}</h1>
                    <p style={{margin:"0 0 18px",color:"#eee",fontSize:15,lineHeight:1.65,fontFamily:"sans-serif", textShadow: "1px 1px 2px rgba(0,0,0,0.5)"}}>{p.intro}</p>
                    <div style={{display:"flex",gap:14,fontSize:12,color:"#eee",fontFamily:"sans-serif",alignItems:"center", textShadow: "1px 1px 1px rgba(0,0,0,0.5)"}}>
                      <span style={{fontWeight:700,color:C.accentBright}}>{p.author}</span>
                      <span>·</span><span>{p.date}</span>
                      <span>·</span><span>⏱ {p.readTime} мин</span>
                      <span>·</span><span>👁 {p.views}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",flexDirection:"column"}}>
                {allPosts.slice(1,4).map((p,i)=>(
                  <div key={p.id} onClick={()=>openPost(p)} className="image-container" style={{padding:"18px 22px",cursor:"pointer",flex:1,borderBottom:i<2?`1px solid ${C.ink}`:"none",transition:"opacity 0.15s", position:'relative', display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
                    <img src={COVER_IMAGES[p.cover] || COVER_IMAGES.btc} alt={p.title} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0}} />
                    <div className="gradient-overlay" style={{zIndex:1}} />
                    <div style={{position:'relative', zIndex:2}}>
                      <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                        <span style={{fontSize:16, color: 'white'}}>{COVER_ICON[p.cover] || "📄"}</span>
                        <span style={{fontSize:9,color:'rgba(255,255,255,0.8)',letterSpacing:"0.1em",fontWeight:700,fontFamily:"sans-serif"}}>{(p.catLabel||"").toUpperCase()}</span>
                      </div>
                      <div style={{fontSize:"clamp(13px,1.5vw,16px)",fontWeight:800,color:'#fff',lineHeight:1.3,fontFamily:"Georgia,serif",marginBottom:6, textShadow: "1px 1px 2px rgba(0,0,0,0.8)"}}>{p.title}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.9)',fontFamily:"sans-serif", textShadow: "1px 1px 1px rgba(0,0,0,0.5)"}}>{p.readTime} мин · {p.views}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="responsive-grid">
              <div>
                <div style={{marginBottom:36}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18,paddingBottom:10,borderBottom:`2px solid ${C.ink}`}}>
                    <h2 style={{margin:0,fontSize:22,fontWeight:900,fontFamily:"Georgia,serif"}}>Ангиллууд</h2>
                  </div>
                  <div className="category-grid">
                    {CATEGORIES.map(cat=>(
                      <div key={cat.id} onClick={()=>openCat(cat.id)} className="modern-card" style={{padding:"16px",background:C.white,cursor:"pointer",textAlign:"center"}}>
                        <div style={{fontSize:26,marginBottom:8}}>{cat.icon}</div>
                        <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:"sans-serif"}}>{cat.label}</div>
                        <div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif",marginTop:4}}>{cat.count} нийтлэл</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:18,paddingBottom:10,borderBottom:`2px solid ${C.ink}`}}>
                    <h2 style={{margin:0,fontSize:22,fontWeight:900,fontFamily:"Georgia,serif"}}>Сүүлийн нийтлэлүүд</h2>
                  </div>
                  {allPosts.map((p,i)=>(
                    <div key={p.id}>
                      <div onClick={()=>openPost(p)} style={{display:"flex",gap:18,padding:"20px 0",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.querySelector(".ptitle") && (e.currentTarget.querySelector(".ptitle").style.color=C.accent)}
                        onMouseLeave={e=>e.currentTarget.querySelector(".ptitle") && (e.currentTarget.querySelector(".ptitle").style.color=C.ink)}>
                        <div className="image-container" style={{width:100,height:80,borderRadius:6,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32, position: 'relative'}}>
                          <img src={COVER_IMAGES[p.cover] || COVER_IMAGES.btc} alt={p.title} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover'}} />
                          <span style={{position:'relative', zIndex:1}}>{COVER_ICON[p.cover] || "📄"}</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",gap:8,marginBottom:7,alignItems:"center",flexWrap:"wrap"}}>
                            <span style={{fontSize:10,color:C.white,background:C.accent,padding:"2px 8px",fontWeight:700,letterSpacing:"0.08em",fontFamily:"sans-serif"}}>{(p.catLabel||"").toUpperCase()}</span>
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

              <aside style={{display:"flex",flexDirection:"column",gap:24}}>
                <div style={{border:`1.5 solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",background:C.ink,color:"#fff",fontSize:13,fontWeight:800,fontFamily:"sans-serif"}}>🔥 ХАМГИЙН ИХ УНШИХ</div>
                  {[...allPosts].sort((a,b)=>parseFloat(b.views||0)-parseFloat(a.views||0)).slice(0,5).map((p,i)=>(
                    <div key={p.id} onClick={()=>openPost(p)} style={{display:"flex",gap:10,padding:"12px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:C.white}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.accentLight}
                      onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                      <div style={{fontSize:22,fontWeight:900,color:C.border,width:28,flexShrink:0,fontFamily:"Georgia,serif"}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:C.ink,lineHeight:1.3,fontFamily:"Georgia,serif"}}>{p.title}</div>
                        <div style={{fontSize:11,color:C.inkFaint,fontFamily:"sans-serif",marginTop:4}}>👁 {p.views}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{border:`1.5px solid ${C.accent}`,borderRadius:8,padding:"20px",background:C.accentLight}}>
                  <div style={{fontSize:18,marginBottom:8}}>📧</div>
                  <div style={{fontSize:16,fontWeight:800,color:C.ink,marginBottom:8,fontFamily:"Georgia,serif"}}>Долоо хоног бүрийн товхимол</div>
                  <p style={{fontSize:13,color:C.inkLight,margin:"0 0 14px",lineHeight:1.55,fontFamily:"sans-serif"}}>Крипто ертөнцийн чухал ойлголтуудыг энгийн монгол хэлэнд тайлбарлан илгээнэ.</p>
                  <IconButton style={{width:"100%",padding:"10px",background:C.accent,border:"none",color:"#fff",borderRadius:6,fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"sans-serif"}}>Бүртгүүлэх →</IconButton>
                </div>
              </aside>
            </div>
          </div>
        )}

        {screen==="post"&&activePost&&(
          <div style={{paddingTop:32}}>
            <div className="responsive-grid">
              <article>
                <IconButton onClick={()=>setScreen("home")} style={{background:"none",border:`1.5px solid ${C.borderDark}`,color:C.inkLight,cursor:"pointer",padding:"6px 14px",borderRadius:4,fontSize:13,fontFamily:"sans-serif",marginBottom:24}}>← Буцах</IconButton>
                <h1 style={{margin:"0 0 16px",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:900,lineHeight:1.2,color:C.ink,fontFamily:"Georgia,serif"}}>{activePost.title}</h1>
                <p style={{margin:"0 0 20px",fontSize:18,color:C.inkLight,lineHeight:1.6,fontFamily:"Georgia,serif",fontStyle:"italic",borderLeft:`4px solid ${C.accent}`,paddingLeft:16}}>{activePost.subtitle}</p>
                <div className="image-container" style={{height:350,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:90,marginBottom:28,border:`1px solid ${C.border}`, position:'relative'}}>
                  <img src={COVER_IMAGES[activePost.cover] || COVER_IMAGES.btc} alt={activePost.title} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover'}} />
                  <div className="gradient-overlay" />
                </div>
                <div style={{fontSize:16,lineHeight:1.9,color:"#2a2a20",fontFamily:"Georgia,serif"}}>
                  {activePost.sections && activePost.sections.map((s,i)=>(
                    <div key={i} style={{marginBottom:28}}>
                      <h2 style={{margin:"0 0 14px",fontSize:"clamp(18px,2.2vw,24px)",fontWeight:800,color:C.ink,fontFamily:"Georgia,serif",paddingBottom:8,borderBottom:`2px solid ${C.accentLight}`}}>{s.title}</h2>
                      <p style={{margin:"0 0 16px",fontFamily:"sans-serif",fontSize:15,lineHeight:1.75,color:"#3a3a30"}}>{s.body}</p>
                    </div>
                  ))}
                </div>
              </article>
              <aside style={{display:"flex",flexDirection:"column",gap:20}}>
                <div style={{border:`1.5 solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",background:C.ink,color:"#fff",fontSize:12,fontWeight:800,fontFamily:"sans-serif"}}>🔥 ХАМГИЙН ИХ УНШИХ</div>
                  {[...allPosts].sort((a,b)=>parseFloat(b.views||0)-parseFloat(a.views||0)).slice(0,5).map((p,i)=>(
                    <div key={p.id} onClick={()=>openPost(p)} style={{display:"flex",gap:10,padding:"11px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:C.white}}>
                      <div style={{fontSize:20,fontWeight:900,color:C.border,width:24,flexShrink:0}}>{i+1}</div>
                      <div style={{fontSize:12,fontWeight:700,color:C.ink,lineHeight:1.3}}>{p.title}</div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        )}

        {screen==="glossary"&&(
          <div style={{paddingTop:32,paddingBottom:48}}>
            <div className="container-wide" style={{maxWidth:800}}>
              <h1 style={{margin:"0 0 28px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>📖 Крипто толь бичиг</h1>
              <div className="grid-2-cols" style={{gap:12}}>
                {filtered_glossary.map(g=>(
                  <div key={g.term} style={{padding:"16px 18px",background:C.white,border:`1.5px solid ${C.border}`,borderRadius:8}}>
                    <div style={{fontWeight:800,color:C.ink,fontSize:15}}>{g.term}</div>
                    <div style={{fontSize:12,color:C.accent,fontWeight:600,marginBottom:6}}>{g.mn}</div>
                    <div style={{fontSize:13,color:C.inkLight,lineHeight:1.5}}>{g.def}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {screen==="about"&&(
          <div className="container-wide" style={{paddingTop:32,paddingBottom:48,maxWidth:780}}>
            <h1 style={{margin:"0 0 8px",fontSize:36,fontWeight:900,fontFamily:"Georgia,serif"}}>Бидний тухай</h1>
            <div style={{height:3,width:60,background:C.accent,marginBottom:28}}/>
            <p style={{fontSize:17,color:C.inkLight,lineHeight:1.8,fontFamily:"sans-serif"}}>
              Крипто Тайлбарлагч бол Монголын хамгийн том крипто мэдлэгийн блог платформ юм.
            </p>
          </div>
        )}
      </div>

      <footer style={{background:C.ink,color:"#aaa",marginTop:48,padding:"40px 24px 20px"}}>
        <div className="container-wide">
          <div className="category-grid" style={{gap:32,marginBottom:32}}>
            <div>
              <div style={{fontSize:26,fontWeight:900,fontFamily:"Georgia,serif",marginBottom:12}}>
                <span style={{color:"#fff"}}>Крипто</span><span style={{color:C.accentBright}}>Тайлбарлагч</span>
              </div>
              <p style={{fontSize:13,lineHeight:1.7,color:"#bbb",margin:"0 0 16px"}}>Монголын хамгийн найдвартай крипто мэдлэгийн эх сурвалж.</p>
              <div style={{fontSize:11,color:"#777"}}>© 2026 КриптоТайлбарлагч. Бүх эрх хамгаалагдсан.</div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:C.accentBright,marginBottom:14}}>АГУУЛГА</div>
              {[["beginner","Эхлэгчдэд"],["bitcoin","Bitcoin"],["ethereum","Ethereum"]].map(([id,label])=>(
                <div key={id} onClick={()=>openCat(id)} style={{fontSize:13,color:"#bbb",marginBottom:8,cursor:"pointer"}}>{label}</div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fi{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        input:focus{border-color:#0a7c4e !important;box-shadow:0 0 0 3px rgba(10,124,78,0.1)}
        ::selection{background:#e8f5ef;color:#0a7c4e}
      `}</style>
    </div>
  );
}
