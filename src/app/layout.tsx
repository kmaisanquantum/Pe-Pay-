import type { Metadata } from "next";
import { Sora, Space_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DSP Vendor Hub",
  description: "Digitise your paper records with AI — pe.dspng.tech",
  manifest: "/manifest.json",
  themeColor: "#1D6F4F",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${spaceMono.variable}`}>
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
