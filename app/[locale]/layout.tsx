import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { AuthProvider } from "@/contexts/auth-context";
import 'react-toastify/dist/ReactToastify.css';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
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
