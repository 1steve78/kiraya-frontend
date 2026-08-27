import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HyperLocal - Fast Hyperlocal Delivery",
  description: "Order groceries, medicines, bakery items and essentials with fast delivery from local neighborhood shops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} light h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
