import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "../components/GoogleAnalytics";
import VignetteAd from "../components/VignetteAd";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Крипто Тайлбар Толь | Блокчэйн, Биткойн, Крипто Юу Вэ?",
    template: "%s | Крипто Тайлбар Толь",
  },
  description:
    "Крипто тайлбар толь бичиг. Блокчэйн, Биткойн, Койн гэж юу вэ? Crypto нэр томьёоны хамгийн энгийн тайлбарууд Монгол хэлээр (Cyrillic & Latin search friendly).",
  keywords:
    "крипто тайлбар, крипто гэж юу вэ, блокчэйн тайлбар, биткойн гэж юу вэ, койн гэж юу вэ, крипто толь бичиг, крипто сургалт, крипто арилжаа хийх заавар, цахим мөнгө, crypto tailbar, crypto gej yu ve, bitcoin gej yu ve, blockchain tailbar, coin gej yu ve, crypto toli bichig, crypto mgl, coin haanaas avah ve, coin ariljaa, crypto surgalt, blockchain mongolia",
  verification: {
    google: "ANxdo5-GCya_--dWhCSLTk9pSh3emfgEw_Y75MCgooU",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Крипто Тайлбар Толь — Блокчэйн, Криптог Энгийнээр",
    description:
      "Крипто нэр томьёо, блокчэйн технологи, биткойн болон альткойны тухай ойлголтуудыг хамгийн энгийнээр тайлбарласан толь бичиг. Bitcoin, Coin, Crypto gej yu ve?",
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
        <VignetteAd />
        {children}
      </body>
    </html>
  );
}