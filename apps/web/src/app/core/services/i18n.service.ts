import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const DEFAULT_LANGUAGE = 'vi';
export const I18N_NAMESPACES = ['common', 'onboarding', 'lesson'] as const;

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [DEFAULT_LANGUAGE],
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: '/i18n/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
