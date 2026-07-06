import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ToastContainer } from "@/components/ui/ToastContainer";
import { DialogContainer } from "@/components/ui/DialogContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'enpiistudio — Discover, develop, display',
    template: '%s',
  },
  description:
    'Studio kecil enpii — tempat bikin tools, menulis catatan, dan merakit source code. Beberapa dishare gratis, beberapa dijual.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    siteName: 'enpiistudio',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Global UI containers — client components, mount sekali di root */}
        <ToastContainer />
        <DialogContainer />
      </body>
    </html>
  );
}