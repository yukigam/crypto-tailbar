import CryptoTailbarClient from './CryptoTailbarClient';
import { getClientPageData } from '../lib/clientPageData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const pageData = await getClientPageData();

  return <CryptoTailbarClient {...pageData} />;
}
