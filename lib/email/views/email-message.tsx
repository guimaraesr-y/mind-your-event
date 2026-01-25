import { getLocale } from 'next-intl/server';
import React from 'react';

interface EmailMessageTemplateProps {
  subject: string;
  message: string;
}

export const EmailMessageTemplate: React.FC<EmailMessageTemplateProps> = async ({ subject, message }) => {
  const locale = await getLocale();
  const containerStyle = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: 'var(--card, #ffffff)',
    borderRadius: 'var(--radius-lg, 0.75rem)',
    border: '1px solid var(--border, #e5e7eb)',
  };

  const bodyStyle = {
    fontFamily: 'var(--font-sans, sans-serif)',
    backgroundColor: 'var(--background, #f9fafb)',
    color: 'var(--foreground, #111827)',
    lineHeight: '1.5',
    margin: 0,
    padding: 0,
  };

  return (
    <html lang={locale}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
        <style>{`
          :root {
            --background: oklch(0.99 0.01 80);
            --foreground: oklch(0.15 0.03 50);
            --card: oklch(1 0 0);
            --border: oklch(0.94 0.02 60);
            --muted-foreground: oklch(0.45 0.02 50);
            --radius-lg: 0.75rem;
            --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
          }
        `}</style>
      </head>
      <body style={bodyStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--foreground, #111827)' }}>MindYourEvent</h1>
          </div>
          <div style={{ padding: '20px 0' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--foreground, #111827)', marginBottom: '20px' }}>{subject}</h2>
            <p style={{ margin: '0 0 15px' }}>{message}</p>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--border, #e5e7eb)', fontSize: '12px', color: 'var(--muted-foreground, #6b7280)' }}>
            <p>&copy; {new Date().getFullYear()} MindYourEvent. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  );
};