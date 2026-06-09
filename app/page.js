import CryptoTailbarClient from './CryptoTailbarClient';
import { getClientPageData } from '../lib/clientPageData';

export const revalidate = 60;

export default async function Page() {
  const pageData = await getClientPageData();

  return <CryptoTailbarClient {...pageData} />;
}
