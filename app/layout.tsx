import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import {NextIntlClientProvider} from 'next-intl';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindYourEvent",
  description: "Schedule events without the back-and-forth",
};

import { AuthProvider } from "@/contexts/auth-context";
import 'react-toastify/dist/ReactToastify.css';

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
        <NextIntlClientProvider>
          <AuthProvider>
            {children}
            <ToastContainer
              position="bottom-right"
              stacked={true}
            />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
