import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';

import { AudioSpeedSetting } from '../components/AudioSpeedSetting';
import { DailyGoalSetting } from '../components/DailyGoalSetting';
import { PinyinVisibilitySetting } from '../components/PinyinVisibilitySetting';
import { ProgressBackupSection } from '../components/ProgressBackupSection';
import { useProgressBackup } from '../hooks/useProgressBackup';
import { useSettings } from '../hooks/useSettings';

/**
 * Màn Cài đặt (S8.2): mục tiêu mỗi ngày, tốc độ audio mặc định, hiện pinyin.
 * Mục Sao lưu tiến độ (S8.5) không phụ thuộc việc nạp tùy chọn xong.
 */
const SettingsContainer = () => {
  const { t } = useTranslation('settings');
  const {
    preferences,
    saveErrorId,
    changeDailyGoal,
    changeDefaultAudioSpeed,
    changePinyinVisibility,
    reloadPreferences,
  } = useSettings();
  const backup = useProgressBackup(reloadPreferences);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <Link
        to={ROUTE_PATHS.learningPaths}
        className="settings-back-link self-start"
      >
        {t('backLink')}
      </Link>
      <h1 className="settings-title">{t('title')}</h1>
      {saveErrorId !== null && (
        <p role="alert" key={saveErrorId} className="settings-error p-md">
          {t('saveError')}
        </p>
      )}
      {preferences === null ? (
        <p role="status">{t('loading')}</p>
      ) : (
        <>
          <DailyGoalSetting
            value={preferences.dailyGoalMinutes}
            onChange={changeDailyGoal}
          />
          <AudioSpeedSetting
            value={preferences.defaultAudioSpeed}
            onChange={changeDefaultAudioSpeed}
          />
          <PinyinVisibilitySetting
            value={preferences.isPinyinVisible}
            onChange={changePinyinVisibility}
          />
        </>
      )}
      <ProgressBackupSection backup={backup} />
    </main>
  );
};

export default SettingsContainer;
