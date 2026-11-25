import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://admin.controfferta.it"),
  title: {
    default: "Controfferta.it Admin Dashboard",
    template: `%s | Controfferta.it Admin Dashboard`,
  },
  description: "Controfferta.it admin dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
