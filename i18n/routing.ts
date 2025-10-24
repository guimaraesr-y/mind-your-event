import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    localeCookie: {
        name: 'USER_LOCALE',
        maxAge: 60 * 60 * 24 * 365
    },
    localePrefix: 'never',
    localeDetection: true,
});
