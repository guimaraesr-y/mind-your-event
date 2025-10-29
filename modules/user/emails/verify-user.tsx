import { getTranslations } from 'next-intl/server';
import React from 'react';

interface VerifyUserTemplateProps {
  email: string;
  token: string;
}

export const VerifyUserTemplate: React.FC<VerifyUserTemplateProps> = async ({ email, token }) => {
  const t = await getTranslations('UserEmail.VerifyEmail');

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
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Verification Code</title>
        <style>{`
          :root {
            --background: oklch(0.99 0.01 80);
            --foreground: oklch(0.15 0.03 50);
            --card: oklch(1 0 0);
            --border: oklch(0.94 0.02 60);
            --primary: oklch(0.7 0.18 50);
            --muted: oklch(0.97 0.01 70);
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
            <p style={{ margin: '0 0 15px' }}>{t('hello', { name: email })}</p>
            <p style={{ margin: '0 0 15px' }}>
              {t('thanks')}
            </p>
            <div style={{
              display: 'block',
              width: 'fit-content',
              margin: '20px auto',
              padding: '12px 24px',
              backgroundColor: 'var(--muted, #f3f4f6)',
              borderRadius: '6px',
              fontSize: '28px',
              fontWeight: 'bold',
              letterSpacing: '4px',
              textAlign: 'center',
              color: 'var(--primary, #3b82f6)',
            }}>
              {token}
            </div>
            <p style={{ margin: '0 0 15px' }}>{t('ifFallback')}</p>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--border, #e5e7eb)', fontSize: '12px', color: 'var(--muted-foreground, #6b7280)' }}>
            <p>&copy; {new Date().getFullYear()} MindYourEvent. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  );
};