import { useTranslation } from 'react-i18next';

/** Màn Trang chủ (S8.1): điểm vào mỗi lần mở lại app sau onboarding. */
const HomeContainer = () => {
  const { t } = useTranslation('home');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <h1>{t('title')}</h1>
    </main>
  );
};

export default HomeContainer;
