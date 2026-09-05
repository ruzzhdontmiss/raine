import { Fraunces, Sora } from "next/font/google";
import RainCanvas from "@/components/RainCanvas";
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

export const metadata = {
  title: "RAINE — watch calmly",
  description: "A minimal, rainy-lake movie browser. Study project.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${sora.variable}`} suppressHydrationWarning>
        <RainCanvas />
        {children}
        <footer className="footer">built as a study project · Next.js fullstack</footer>
      </body>
    </html>
  );
}
