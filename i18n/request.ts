import { hasLocale } from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import { routing } from './routing';
import { headers } from 'next/headers';
 
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale || (await headers()).get('Accept-Language')?.split(',')[0];

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
