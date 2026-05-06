import { ReactNode } from "react";
import GoogleAnalytics from "../components/GoogleAnalytics";

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