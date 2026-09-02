import type { Metadata } from "next";
import { Fraunces, Tiny5 } from "next/font/google";
import "./globals.css";

const tiny5 = Tiny5({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tiny5",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Aiden Guan — the meadow",
  description:
    "Part the grass. A pixel meadow hiding Aiden Guan’s work: SideSpace, Fish, and Corgi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${tiny5.variable} ${fraunces.variable} h-full`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
