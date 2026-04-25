import type { Metadata } from "next";
import { DM_Sans, Nunito } from "next/font/google";
import type { ReactNode } from "react";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
  weight: ["800"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${dmSans.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
