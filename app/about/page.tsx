import CryptoTailbarClient from '../CryptoTailbarClient';
import { getClientPageData } from '../../lib/clientPageData';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Бидний Тухай | КриптоТайлбарлагч',
  description:
    'КриптоТайлбарлагч вэбсайтын тухай мэдээлэл. Монголчуудад крипто болон блокчейн технологийн мэдлэгийг үнэ төлбөргүй хүргэх зорилготой хувийн блог.',
};

export default async function AboutPage() {
  const pageData = await getClientPageData();
  return <CryptoTailbarClient {...pageData} initialScreen="about" />;
}
