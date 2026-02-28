import { ToastContainer } from 'react-toastify';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { AuthProvider } from "@/contexts/auth-context";
import 'react-toastify/dist/ReactToastify.css';

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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        {children}
        <ToastContainer
          position="bottom-right"
          theme="light"
          stacked={true}
        />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

