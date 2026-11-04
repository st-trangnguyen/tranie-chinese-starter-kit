import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '@assets/i18n/vi/common.json';
import lesson from '@assets/i18n/vi/lesson.json';
import onboarding from '@assets/i18n/vi/onboarding.json';

/**
 * Instance i18n chỉ dùng cho test, nạp thẳng file `vi` thật.
 * Không import `@core/services/i18n.service` trong test: nó init khi import và tải JSON qua HTTP.
 */
const testI18n = createInstance();

testI18n.use(initReactI18next).init({
  lng: 'vi',
  fallbackLng: 'vi',
  ns: ['common', 'onboarding', 'lesson'],
  defaultNS: 'common',
  resources: { vi: { common, onboarding, lesson } },
  interpolation: { escapeValue: false },
});

export default testI18n;
