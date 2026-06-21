import type { Metadata } from "next";
import { Outfit, Inter, Playfair_Display, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { PassportProvider } from "@/context/PassportContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Accessible AI 🌈 | AI-Powered Accessibility Mapping",
  description: "Discover public place accessibility before you arrive. Using Computer Vision & Geospatial Intelligence, we map cafes, hospitals, and parks for wheelchair users, senior citizens, parents, and temporary injuries.",
  keywords: ["accessibility", "AI", "computer vision", "wheelchair access", "stroller accessibility", "safe routes", "accessible mapping", "inclusive cities"],
  authors: [{ name: "Accessible AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${inter.variable} ${playfair.variable} ${instrument.variable} antialiased min-h-screen text-slate-800`}
      >
        <PassportProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </PassportProvider>
      </body>
    </html>
  );
}
