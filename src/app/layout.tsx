import type { Metadata, Viewport } from "next";
import { Caveat, Inter, Kalam, Newsreader, Special_Elite } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";
import "./art-school.css";
import "./art-family.css";
import "./art-care.css";
import "./art-celebrate.css";
import "./art-milestones.css";
import "./art-seasons.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kalam", display: "swap" });
const elite = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-elite", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, siteName: site.name, type: "website" },
};

export const viewport: Viewport = { themeColor: "#fbfbfd", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${inter.variable} ${caveat.variable} ${newsreader.variable} ${kalam.variable} ${elite.variable}`}>
      <body>{children}</body>
    </html>
  );
}
