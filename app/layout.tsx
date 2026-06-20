import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "../components/GoogleAnalytics";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Крипто Тайлбар Толь | Блокчэйн, Биткойн, Крипто Юу Вэ?",
    template: "%s | Крипто Тайлбар Толь",
  },
  description:
    "Крипто ертөнцийн бүх нарийн нэр томьёо, блокчэйн технологи, биткойн болон альткойны тухай ойлголтуудыг хамгийн энгийнээр тайлбарласан Монголын анхны крипто толь бичиг.",
  keywords:
    "крипто тайлбар, крипто гэж юу вэ, блокчэйн тайлбар, биткойн гэж юу вэ, койн гэж юу вэ, крипто толь бичиг, crypto tailbar, blockchain mongolia, крипто сургалт, крипто арилжаа хийх заавар",
  verification: {
    google: "ANxdo5-GCya_--dWhCSLTk9pSh3emfgEw_Y75MCgooU",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Крипто Тайлбар Толь — Блокчэйн, Криптог Энгийнээр",
    description:
      "Крипто нэр томьёоноос эхлээд блокчэйн хэрхэн ажилладаг тухай бүх тайлбарыг нэг дороос Монгол хэлээр уншаарай.",
    locale: "mn_MN",
    siteName: "Crypto Tailbar",
    type: "website",
  },
  alternates: {
    canonical: "https://crypto-tailbar-gyrr.vercel.app/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}