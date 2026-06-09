import CryptoTailbarClient from '../CryptoTailbarClient';
import { getClientPageData } from '../../lib/clientPageData';
import type { Metadata } from 'next';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Нууцлалын Бодлого | КриптоТайлбарлагч',
  description:
    'КриптоТайлбарлагч вэбсайтын нууцлалын бодлого. Таны хувийн мэдээлэл хэрхэн цуглуулагдаж, хамгаалагдаж байгааг мэдэж аваарай.',
};

export default async function PrivacyPage() {
  const pageData = await getClientPageData();
  return <CryptoTailbarClient {...pageData} initialScreen="privacy" />;
}
