/** Version 1: string category IDs stored on Sanity post.category */
export const CATEGORY_IDS = [
  'bitcoin',
  'ethereum',
  'defi',
  'trading',
  'wallet',
  'nft-web3',
  'mining',
  'beginners',
  'dictionary',
  'about',
];

export const CATEGORIES = [
  { id: 'dictionary', label: 'Толь бичиг', icon: '📚' },
  { id: 'about', label: 'Бидний тухай', icon: 'ℹ️' },
  { id: 'beginners', label: 'Эхлэгчдэд', icon: '🔰' },
  { id: 'bitcoin', label: 'Bitcoin', icon: '₿' },
  { id: 'ethereum', label: 'Ethereum', icon: 'Ξ' },
  { id: 'defi', label: 'DeFi', icon: '🦄' },
  { id: 'trading', label: 'Арилжаа', icon: '📈' },
  { id: 'wallet', label: 'Түрийвч', icon: '👛' },
  { id: 'nft-web3', label: 'NFT & Web3', icon: '🖼️' },
  { id: 'mining', label: 'Майнинг', icon: '⛏️' },
];

/** Categories that open dedicated screens instead of the post list view */
export const SPECIAL_CATEGORY_SCREENS = {
  dictionary: 'glossary',
  about: 'about',
};

/** Legacy Sanity category document titles → post.category slug */
export const LEGACY_TITLE_TO_CATEGORY = {
  'Эхлэгчдэд': 'beginners',
  Bitcoin: 'bitcoin',
  Ethereum: 'ethereum',
  DeFi: 'defi',
  'Арилжаа': 'trading',
  'Түрийвч': 'wallet',
  'NFT & Web3': 'nft-web3',
  Майнинг: 'mining',
  'Толь бичиг': 'dictionary',
  'Бидний тухай': 'about',
};

/** Old frontend IDs → current schema slugs */
export const LEGACY_ID_MAP = {
  beginner: 'beginners',
  wallets: 'wallet',
  nft: 'nft-web3',
  glossary: 'dictionary',
};

export function normalizeCategoryId(id) {
  if (!id) return 'beginners';
  return LEGACY_ID_MAP[id] || id;
}

export function getCategoryLabel(id) {
  const normalized = normalizeCategoryId(id);
  return CATEGORIES.find((c) => c.id === normalized)?.label || 'Мэдээ';
}

export function isNavItemActive(screen, activeCat, id) {
  if (id === 'home') return screen === 'home';
  const specialScreen = SPECIAL_CATEGORY_SCREENS[id];
  if (specialScreen) return screen === specialScreen;
  return screen === 'category' && activeCat === id;
}
