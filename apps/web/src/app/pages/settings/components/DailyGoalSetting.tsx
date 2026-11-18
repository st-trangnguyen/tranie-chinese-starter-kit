import { useTranslation } from 'react-i18next';
import { DAILY_GOAL_OPTIONS, type DailyGoalMinutes } from '@csk/shared';

interface DailyGoalSettingProps {
  value: DailyGoalMinutes;
}

export function DailyGoalSetting({ value }: DailyGoalSettingProps) {
  const { t } = useTranslation('settings');

  return (
    <fieldset className="settings-group flex flex-col gap-md p-lg">
      <legend className="settings-group-label px-sm">
        {t('dailyGoal.label')}
      </legend>
      {DAILY_GOAL_OPTIONS.map((minutes) => (
        <label
          key={minutes}
          className={`settings-option flex items-center gap-md p-md ${minutes === value ? 'is-active' : ''}`}
        >
          <input
            type="radio"
            name="daily-goal"
            value={minutes}
            checked={minutes === value}
            readOnly
            className="settings-option-input"
          />
          {t('dailyGoal.option', { count: minutes })}
        </label>
      ))}
    </fieldset>
  );
}
