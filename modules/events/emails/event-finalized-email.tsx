import { getTranslations } from 'next-intl/server';
import React from 'react';
import { getFormatter } from 'next-intl/server';

interface EventFinalizedEmailTemplateProps {
  userName: string;
  eventTitle: string;
  eventLink: string;
  finalizedDate: string;
  finalizedTime: string;
}

export const EventFinalizedEmailTemplate: React.FC<EventFinalizedEmailTemplateProps> = async ({
  userName,
  eventTitle,
  eventLink,
  finalizedDate,
  finalizedTime,
}) => {
  const t = await getTranslations('Email.Event.FinalizedEmail');
  const formatter = await getFormatter();
  const formattedDate = formatter.dateTime(new Date(finalizedDate)) + ', ' + finalizedTime;

  const bodyStyle = {
    fontFamily: 'var(--font-sans, sans-serif)',
    backgroundColor: 'var(--background, #f9fafb)',
    color: 'var(--foreground, #111827)',
    lineHeight: '1.5',
    margin: 0,
    padding: '20px',
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'var(--card, #ffffff)',
    borderRadius: 'var(--radius-lg, 0.75rem)',
    border: '1px solid var(--border, #e5e7eb)',
    overflow: 'hidden',
  };

  const headerStyle = {
    textAlign: 'center' as const,
    padding: '20px',
    borderBottom: '1px solid var(--border, #e5e7eb)',
    backgroundColor: 'var(--muted, #f3f4f6)',
  };

  const contentStyle = {
    padding: '30px',
    textAlign: 'center' as const,
  };

  const buttonStyle = {
    display: 'inline-block',
    padding: '12px 24px',
    margin: '20px 0',
    backgroundColor: 'var(--primary, #3b82f6)',
    color: '#ffffff',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
  };

  const footerStyle = {
    textAlign: 'center' as const,
    padding: '20px',
    borderTop: '1px solid var(--border, #e5e7eb)',
    fontSize: '12px',
    color: 'var(--muted-foreground, #6b7280)',
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t('title')}</title>
        <style>{`
          :root {
            --background: oklch(0.99 0.01 80);
            --foreground: oklch(0.15 0.03 50);
            --card: oklch(1 0 0);
            --border: oklch(0.94 0.02 60);
            --primary: oklch(0.6 0.2 260);
            --muted: oklch(0.97 0.01 70);
            --muted-foreground: oklch(0.45 0.02 50);
            --radius-lg: 0.75rem;
            --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
          }
          body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}</style>
      </head>
      <body style={bodyStyle}>
        <div style={containerStyle}>
          <div style={headerStyle}>
            <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--foreground, #111827)' }}>MindYourEvent</h1>
            <p style={{ margin: '5px 0 0', color: 'var(--muted-foreground, #6b7280)' }}>{t('subtitle')}</p>
          </div>
          <div style={contentStyle}>
            <h2 style={{ fontSize: '22px', color: 'var(--foreground, #111827)', marginBottom: '10px' }}>
              {t('greeting', { authorName: userName })}
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              {t('eventFinalized', { eventTitle })}
            </p>
            <div style={{
              padding: '20px',
              backgroundColor: 'var(--muted, #f3f4f6)',
              borderRadius: '6px',
              textAlign: 'left',
              marginBottom: '20px',
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>{t('finalizedDetails')}</h3>
              <p style={{ margin: 0 }}>{t('finalizedDate', { finalizedDate: formattedDate })}</p>
            </div>
            <p style={{ margin: '0 0 15px' }}>{t('viewEventDetails')}</p>
            <a href={eventLink} style={buttonStyle}>
              {t('viewEventButton')}
            </a>
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground, #6b7280)', marginTop: '20px' }}>
              {t('linkNotWorking')} <a href={eventLink} style={{ color: 'var(--primary, #3b82f6)' }}>{t('clickHere')}</a>
            </p>
          </div>
          <div style={footerStyle}>
            <p>&copy; {new Date().getFullYear()} MindYourEvent. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  );
};