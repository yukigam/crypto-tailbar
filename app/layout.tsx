import { ReactNode } from "react";
import type { Metadata } from "next";
import GoogleAnalytics from "../components/GoogleAnalytics";

export const metadata: Metadata = {
  verification: {
    google: "ANxdo5-GCya_--dWhCSLTk9pSh3emfgEw_Y75MCgooU",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}