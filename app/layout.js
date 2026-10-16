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
  metadataBase: new URL("https://raine.onrender.com"),
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
      <body className={`${fraunces.variable} ${sora.variable}`} suppressHydrationWarning>
        <RainCanvas />
        {children}
        <footer className="footer">watch calmly</footer>
      </body>
    </html>
  );
}
