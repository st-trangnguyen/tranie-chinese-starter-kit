import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';

import { AudioSpeedSetting } from '../components/AudioSpeedSetting';
import { DailyGoalSetting } from '../components/DailyGoalSetting';
import { PinyinVisibilitySetting } from '../components/PinyinVisibilitySetting';
import { useSettings } from '../hooks/useSettings';

/** Màn Cài đặt (S8.2): mục tiêu mỗi ngày, tốc độ audio mặc định, hiện pinyin. */
const SettingsContainer = () => {
  const { t } = useTranslation('settings');
  const { preferences, changeDailyGoal, changePinyinVisibility } =
    useSettings();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <Link
        to={ROUTE_PATHS.learningPaths}
        className="settings-back-link self-start"
      >
        {t('backLink')}
      </Link>
      <h1 className="settings-title">{t('title')}</h1>
      {preferences === null ? (
        <p role="status">{t('loading')}</p>
      ) : (
        <>
          <DailyGoalSetting
            value={preferences.dailyGoalMinutes}
            onChange={changeDailyGoal}
          />
          <AudioSpeedSetting value={preferences.defaultAudioSpeed} />
          <PinyinVisibilitySetting
            value={preferences.isPinyinVisible}
            onChange={changePinyinVisibility}
          />
        </>
      )}
    </main>
  );
};

export default SettingsContainer;
