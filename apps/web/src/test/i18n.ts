import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from '@assets/i18n/vi/common.json';
import home from '@assets/i18n/vi/home.json';
import learningPath from '@assets/i18n/vi/learning-path.json';
import lesson from '@assets/i18n/vi/lesson.json';
import onboarding from '@assets/i18n/vi/onboarding.json';
import settings from '@assets/i18n/vi/settings.json';
import strokeOrder from '@assets/i18n/vi/stroke-order.json';
import writingPractice from '@assets/i18n/vi/writing-practice.json';

/**
 * Instance i18n chỉ dùng cho test, nạp thẳng file `vi` thật.
 * Không import `@core/services/i18n.service` trong test: nó init khi import và tải JSON qua HTTP.
 */
const testI18n = createInstance();

testI18n.use(initReactI18next).init({
  lng: 'vi',
  fallbackLng: 'vi',
  ns: [
    'common',
    'onboarding',
    'learning-path',
    'lesson',
    'stroke-order',
    'writing-practice',
    'home',
    'settings',
  ],
  defaultNS: 'common',
  resources: {
    vi: {
      common,
      onboarding,
      'learning-path': learningPath,
      lesson,
      'stroke-order': strokeOrder,
      'writing-practice': writingPractice,
      home,
      settings,
    },
  },
  interpolation: { escapeValue: false },
});

export default testI18n;
