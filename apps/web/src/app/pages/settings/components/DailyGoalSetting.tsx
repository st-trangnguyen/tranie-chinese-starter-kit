import { useTranslation } from 'react-i18next';
import { DAILY_GOAL_OPTIONS, type DailyGoalMinutes } from '@csk/shared';

interface DailyGoalSettingProps {
  value: DailyGoalMinutes;
  onChange: (minutes: DailyGoalMinutes) => void;
}

export function DailyGoalSetting({ value, onChange }: DailyGoalSettingProps) {
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
            onChange={() => onChange(minutes)}
            className="settings-option-input"
          />
          {t('dailyGoal.option', { count: minutes })}
        </label>
      ))}
    </fieldset>
  );
}
