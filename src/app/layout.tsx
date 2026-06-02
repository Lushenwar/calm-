import type { Metadata } from "next";
import { Bebas_Neue, Syne, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CALM — Can AI Locate Manhwa?",
  description:
    "Discover, track, and get AI-powered recommendations for the best manhwa and webtoons.",
  keywords: ["manhwa", "webtoon", "manga", "AI recommendation", "tracker"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${syne.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0c0c12]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-8 text-center text-[#5a5670] font-ui text-sm">
          <p>
            CALM — Can AI Locate Manhwa? &copy; 2026 &middot; Built for readers,
            powered by intelligence.
          </p>
        </footer>
      </body>
    </html>
  );
}
