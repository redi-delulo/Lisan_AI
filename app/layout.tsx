import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

export const metadata: Metadata = {
  metadataBase: appUrl ? new URL(appUrl) : undefined,
  title: {
    default: "Lisan AI",
    template: "%s | Lisan AI",
  },
  description: "AI-powered English and Arabic learning with conversation, vocabulary, grammar, speaking, and translation practice.",
  applicationName: "Lisan AI",
  openGraph: {
    title: "Lisan AI",
    description: "Practice English and Arabic with an AI tutor powered by a secure backend API.",
    type: "website",
    url: appUrl || undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "Lisan AI",
    description: "Practice English and Arabic with an AI tutor powered by a secure backend API.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
