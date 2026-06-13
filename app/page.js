import CryptoTailbarClient from './CryptoTailbarClient';
import { getClientPageData } from '../lib/clientPageData';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const pageData = await getClientPageData();

  return <CryptoTailbarClient {...pageData} />;
}
