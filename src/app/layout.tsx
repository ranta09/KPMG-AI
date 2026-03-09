import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InteractiveLayout from "@/components/InteractiveLayout";
import AuthCheckRedirect from "@/components/AuthCheckRedirect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KPMG AI",
  description: "Enterprise AI-powered SAP transformation platform — BRD generation, build orchestration, and AI agent control.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthCheckRedirect />
        <InteractiveLayout>
          {children}
        </InteractiveLayout>
      </body>
    </html>
  );
}
