import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';

const resources = {
    en,
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    interpolation: {
        escapeValue: false,
    },
    fallbackLng: 'en',
    debug: false,
});

export { i18n };
