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
    "A night meadow. Something is missing from the clearing. Aiden Guan’s work is waiting in the grass.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${tiny5.variable} ${fraunces.variable} h-full`}
    >
      <body className="h-full" style={{ background: "#0c1610", color: "#e8dcc4" }}>
        {children}
      </body>
    </html>
  );
}
