import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";
import SessionProvider from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Food Tracker",
  description: "Track your meals with MongoDB and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
