import { Inter, Space_Mono } from "next/font/google";

export const FontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const FontMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
