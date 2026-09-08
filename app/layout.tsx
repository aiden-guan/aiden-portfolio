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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aiden Guan — the meadow",
    template: "%s — Aiden Guan",
  },
  description:
    "A night meadow. Something is missing from the clearing. Aiden Guan’s work is waiting in the grass.",
  applicationName: "Aiden Guan",
  authors: [{ name: "Aiden Guan" }],
  creator: "Aiden Guan",
  openGraph: {
    type: "website",
    title: "Aiden Guan — the meadow",
    description:
      "A night meadow. Something is missing from the clearing. Aiden Guan’s work is waiting in the grass.",
    siteName: "Aiden Guan",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aiden Guan — the meadow",
    description:
      "Building things people can play with. The work is waiting in the grass.",
  },
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
