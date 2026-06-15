import { urlFor } from './sanity';
import {
  getCategoryLabel,
  LEGACY_TITLE_TO_CATEGORY,
  normalizeCategoryId,
} from './categories';

const categoryCovers = {
  beginners: 'btc',
  bitcoin: 'btc',
  ethereum: 'eth',
  defi: 'defi',
  trading: 'law',
  wallet: 'wallet',
  'nft-web3': 'nft',
  mining: 'mining',
  dictionary: 'law',
  about: 'btc',
};

const defaultSubtitles = {
  beginners:
    'Крипто валютын анхан шатны чухал ойлголтуудыг энгийн монгол хэлээр тайлбарласан дэлгэрэнгүй нийтлэл.',
  bitcoin: 'Биткойны технологи, түүх, ирээдүйн чиг хандлагын тухай дэлгэрэнгүй мэдээлэл.',
  ethereum: 'Этериум сүлжээ, ухаалаг гэрээ болон dApps-ийн тухай ойлголт.',
  defi: 'Төвлөрсөн бус санхүүгийн систем, зээл олголт, staking-ийн тухай.',
  trading: 'Крипто арилжаа, техникийн шинжилгээ, зах зээлийн аюулгүй байдал.',
  wallet: 'Хөрөнгөө аюулгүй хадгалах, халуун болон хүйтэн түрийвчний хэрэглээ.',
  'nft-web3': 'Давтагдашгүй токен буюу NFT-ийн технологи, дижитал урлагийн зах зээл.',
  mining: 'Биткойн олборлолт, тоног төхөөрөмж, цахилгааны зардал, бодит тооцоо.',
  dictionary: 'Крипто болон блокчейнтэй холбоотой нэр томьёоны тайлбар.',
  about: 'КриптоТайлбарлагч баг, зорилго болон мэдээллийн эх сурвалжийн тухай.',
};

function extractBodyText(body, excerpt, title) {
  if (Array.isArray(body)) {
    return body
      .map((b) =>
        b.children ? b.children.map((ch) => ch.text).join('') : ''
      )
      .filter(Boolean)
      .join('\n\n');
  }
  return excerpt || title;
}

export function mapSanityPost(p, index = 0) {
  const isSecurityPost = p.slug?.current === 'digital-asset-security-guide';
  const internalCat = typeof p.category === 'string' && p.category && !isSecurityPost
    ? normalizeCategoryId(p.category)
    : null;
  const catLabel = internalCat ? getCategoryLabel(internalCat) : null;

  const bodyText = extractBodyText(p.body, p.excerpt, p.title);
  const defaultCover = categoryCovers[internalCat] || 'btc';
  const defaultSub =
    defaultSubtitles[internalCat] ||
    'Крипто ертөнцийн сонирхолтой мэдээ мэдээлэл, дүн шинжилгээ.';

  const defaultBody = `Энэхүү нийтлэлд ${p.title || 'крипто валют'}-ийн талаарх дэлгэрэнгүй мэдээлэл болон зах зээлийн гол ойлголтуудыг багтаасан болно. Та сэдвүүд доороос дэлгэрэнгүй тайлбар бүрийг унших боломжтой.`;
  const finalBody =
    bodyText && bodyText !== p.title ? bodyText : defaultBody;

  return {
    id: `sanity-${p._id}`,
    sanityId: p._id,
    slug: p.slug?.current || p._id,
    cat: internalCat,
    catLabel,
    title: p.title || 'Гарчиггүй',
    subtitle:
      p.excerpt ||
      (bodyText && bodyText !== p.title
        ? `${bodyText.slice(0, 150)}...`
        : defaultSub),
    author: p.author || 'Редактор',
    authorTitle: p.authorTitle || 'Крипто судлаач',
    publishedAt: p.publishedAt || new Date().toISOString(),
    date:
      p.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    difficulty: 'Амархан',
    featured: index === 0,
    cover: p.mainImage ? urlFor(p.mainImage) : defaultCover,
    tags: p.tags || (catLabel ? [catLabel] : []),
    intro:
      p.excerpt ||
      (bodyText && bodyText !== p.title
        ? bodyText.slice(0, 200)
        : defaultSub),
    sections: [{ title: 'Дэлгэрэнгүй', body: finalBody }],
  };
}

export function mapSanityPosts(posts = []) {
  return posts.map((p, i) => mapSanityPost(p, i));
}
