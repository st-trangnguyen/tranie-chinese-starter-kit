import { useTranslation } from 'react-i18next';

import { AudioSpeedSetting } from '../components/AudioSpeedSetting';
import { DailyGoalSetting } from '../components/DailyGoalSetting';
import { PinyinVisibilitySetting } from '../components/PinyinVisibilitySetting';
import { useSettings } from '../hooks/useSettings';

/** Màn Cài đặt (S8.2): mục tiêu mỗi ngày, tốc độ audio mặc định, hiện pinyin. */
const SettingsContainer = () => {
  const { t } = useTranslation('settings');
  const { preferences } = useSettings();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <h1 className="settings-title">{t('title')}</h1>
      {preferences === null ? (
        <p role="status">{t('loading')}</p>
      ) : (
        <>
          <DailyGoalSetting value={preferences.dailyGoalMinutes} />
          <AudioSpeedSetting value={preferences.defaultAudioSpeed} />
          <PinyinVisibilitySetting value={preferences.isPinyinVisible} />
        </>
      )}
    </main>
  );
};

export default SettingsContainer;
