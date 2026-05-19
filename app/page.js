import { getPosts, urlFor } from '../lib/sanity';
import CryptoTailbarClient from './CryptoTailbarClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const data = await getPosts();
  const posts = data?.posts || [];
  
  const catMap = {
    "Эхлэгчдэд": "beginner",
    "Bitcoin": "bitcoin",
    "Ethereum": "ethereum",
    "DeFi": "defi",
    "Арилжаа": "trading",
    "Түрийвч": "wallets",
    "NFT & Web3": "nft",
    "Майнинг": "mining"
  };

  let mappedPosts = [];
  if (posts && posts.length > 0) {
    mappedPosts = posts.map((p, i) => {
      const sanityCat = p.categories?.[0];
      const internalCat = catMap[sanityCat] || (sanityCat ? sanityCat.toLowerCase() : "beginner");

      // Comprehensive body text extraction matching update-sanity.js logic
      const bodyText = Array.isArray(p.body) 
        ? p.body.map(b => b.children ? b.children.map(ch => ch.text).join("") : "").filter(Boolean).join("\n\n")
        : p.excerpt || p.title;

      // Category covers mapping
      const categoryCovers = {
        beginner: "btc",
        bitcoin: "btc",
        ethereum: "eth",
        defi: "defi",
        trading: "law",
        wallets: "wallet",
        nft: "nft",
        mining: "mining"
      };
      const defaultCover = categoryCovers[internalCat] || "btc";

      // Context-aware fallback descriptions
      const defaultSubtitles = {
        beginner: "Крипто валютын анхан шатны чухал ойлголтуудыг энгийн монгол хэлээр тайлбарласан дэлгэрэнгүй нийтлэл.",
        bitcoin: "Биткойны технологи, түүх, ирээдүйн чиг хандлагын тухай дэлгэрэнгүй мэдээлэл.",
        ethereum: "Этериум сүлжээ, ухаалаг гэрээ болон dApps-ийн тухай ойлголт.",
        defi: "Төвлөрсөн бус санхүүгийн систем, зээл олголт, staking-ийн тухай.",
        trading: "Крипто арилжаа, техникийн шинжилгээ, зах зээлийн аюулгүй байдал.",
        wallets: "Хөрөнгөө аюулгүй хадгалах, халуун болон хүйтэн түрийвчний хэрэглээ.",
        nft: "Давтагдашгүй токен буюу NFT-ийн технологи, дижитал урлагийн зах зээл.",
        mining: "Биткойн олборлолт, тоног төхөөрөмж, цахилгааны зардал, бодит тооцоо."
      };
      const defaultSub = defaultSubtitles[internalCat] || "Крипто ертөнцийн сонирхолтой мэдээ мэдээлэл, дүн шинжилгээ.";

      // Body fallback
      const defaultBody = `Энэхүү нийтлэлд ${p.title || 'крипто валют'}-ийн талаарх дэлгэрэнгүй мэдээлэл болон зах зээлийн гол ойлголтуудыг багтаасан болно. Та сэдвүүд доороос дэлгэрэнгүй тайлбар бүрийг унших боломжтой.`;
      const finalBody = bodyText && bodyText !== p.title ? bodyText : defaultBody;

      return {
        id: `sanity-${p._id}`,
        slug: p.slug?.current || p._id,
        cat: internalCat,
        catLabel: sanityCat || "Мэдээ",
        title: p.title || "Гарчиггүй",
        subtitle: p.excerpt || (bodyText && bodyText !== p.title ? bodyText.slice(0, 150) + "..." : defaultSub),
        author: p.author || "Редактор",
        authorTitle: p.authorTitle || "Крипто судлаач",
        date: p.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        readTime: "5",
        views: "1.2K",
        difficulty: "Амархан",
        featured: i === 0,
        cover: p.mainImage ? urlFor(p.mainImage) : defaultCover, 
        tags: p.tags || [sanityCat || "Крипто"],
        intro: p.excerpt || (bodyText && bodyText !== p.title ? bodyText.slice(0, 200) : defaultSub),
        sections: [{ title: "Дэлгэрэнгүй", body: finalBody }]
      };
    });
  }

  const binanceLink = process.env.NEXT_PUBLIC_BINANCE_LINK || process.env.BINANCE_LINK || 'https://www.binance.com/register?ref=561538131';

  return (
    <CryptoTailbarClient 
      initialPosts={mappedPosts} 
      initialCategories={data?.categories} 
      initialGlossary={data?.glossary} 
      binanceLink={binanceLink}
    />
  );
}
