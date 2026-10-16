import { Fraunces, Sora } from "next/font/google";
import RainCanvas from "@/components/RainCanvas";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "600"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "600"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://raine.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "RAINE — watch calmly",
  description: "A minimal, rainy-lake movie & TV browser. Watch calmly.",
  openGraph: {
    title: "RAINE — watch calmly",
    description: "A minimal, rainy-lake movie & TV browser. Watch calmly.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body className={`${fraunces.variable} ${sora.variable}`} suppressHydrationWarning>
        <RainCanvas />
        {children}
        <footer className="footer">
          <p className="footer-disclaimer">
            RAINE does not host, store, or distribute any media files. All content is sourced from third-party providers.
          </p>
          <div className="footer-legal-links">
            <Link href="/legal/terms" className="footer-bracket-link">[ Terms ]</Link>
            <Link href="/legal/privacy" className="footer-bracket-link">[ Privacy ]</Link>
            <Link href="/legal/dmca" className="footer-bracket-link">[ DMCA ]</Link>
          </div>
          <div className="footer-tagline">watch calmly</div>
        </footer>
      </body>
    </html>
  );
}
