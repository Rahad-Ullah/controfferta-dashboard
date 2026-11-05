import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import ClientLayout from './ClientLayout';
import "./globals.css";

const geistSans = {
  variable: "--font-geist-sans",
};

export const metadata: Metadata = {
  title: "CONTROFFERTA.IT - Admin Dashboard",
  description: "CONTROFFERTA.IT Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable}  antialiased h-screen`}
      >
        {/* <ProtectedRoute> */}
        <ClientLayout>
          {children}
          <Toaster />
        </ClientLayout>
        {/* </ProtectedRoute> */}
      </body>
    </html>
  );
}
