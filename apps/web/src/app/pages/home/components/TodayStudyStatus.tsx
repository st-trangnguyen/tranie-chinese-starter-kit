import { useTranslation } from 'react-i18next';

import type { TodayStudy } from '@shared/models/home.model';

interface TodayStudyStatusProps {
  todayStudy: TodayStudy;
}

/** Số phút đã học hôm nay so với mục tiêu ngày trên Trang chủ (S8.1 AC2). */
export function TodayStudyStatus({ todayStudy }: TodayStudyStatusProps) {
  const { t } = useTranslation('home');

  return (
    <div className="home-today-study flex flex-col gap-sm">
      <p>
        {t('todayStudy', {
          minutes: todayStudy.minutes,
          goalMinutes: todayStudy.goalMinutes,
        })}
      </p>
      {todayStudy.isGoalReached && (
        <p className="home-today-study-goal">{t('goalReached')}</p>
      )}
    </div>
  );
}
