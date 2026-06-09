import CryptoTailbarClient from '../CryptoTailbarClient';
import { getClientPageData } from '../../lib/clientPageData';
import type { Metadata } from 'next';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Үйлчилгээний Нөхцөл | КриптоТайлбарлагч',
  description:
    'КриптоТайлбарлагч вэбсайтын үйлчилгээний нөхцөл болон хэрэглэгчийн гэрээ. Вэбсайтыг ашиглахын өмнө уншаарай.',
};

export default async function TermsPage() {
  const pageData = await getClientPageData();
  return <CryptoTailbarClient {...pageData} initialScreen="terms" />;
}
