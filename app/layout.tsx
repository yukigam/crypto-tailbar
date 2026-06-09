import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "../components/GoogleAnalytics";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "КриптоТайлбарлагч | Монгол дахь крипто мэдлэгийн сан",
    template: "%s | КриптоТайлбарлагч",
  },
  description:
    "Монголчуудад крипто болон блокчейн технологийг энгийн, ойлгомжтой хэлбэрээр үнэ төлбөргүй хүргэх мэдлэгийн сан.",
  verification: {
    google: "ANxdo5-GCya_--dWhCSLTk9pSh3emfgEw_Y75MCgooU",
  },
  icons: {
    icon: "/favicon.ico",
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