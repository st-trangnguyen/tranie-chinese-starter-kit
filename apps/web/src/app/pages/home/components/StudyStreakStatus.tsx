import { useTranslation } from 'react-i18next';

interface StudyStreakStatusProps {
  streakDays: number;
}

/** Chuỗi ngày học liên tiếp đạt mục tiêu trên Trang chủ (S8.3 AC2). */
export function StudyStreakStatus({ streakDays }: StudyStreakStatusProps) {
  const { t } = useTranslation('home');

  // Biến `days`, không `count`: tránh i18next tìm key số nhiều (design D5).
  return <p className="home-streak">{t('streak', { days: streakDays })}</p>;
}
