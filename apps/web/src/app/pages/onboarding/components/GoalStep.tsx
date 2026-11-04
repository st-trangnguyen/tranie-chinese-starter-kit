import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DAILY_GOAL_OPTIONS, type DailyGoalMinutes } from '@csk/shared';

interface GoalStepProps {
  value: DailyGoalMinutes;
  isSaving: boolean;
  onChange: (minutes: DailyGoalMinutes) => void;
  onConfirm: () => void;
}

export function GoalStep({
  value,
  isSaving,
  onChange,
  onConfirm,
}: GoalStepProps) {
  const { t } = useTranslation('onboarding');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm();
  };

  return (
    <form className="flex flex-col gap-xl" onSubmit={handleSubmit}>
      <fieldset className="flex flex-col gap-md">
        <legend className="onboarding-title mb-sm">{t('goal.title')}</legend>
        <p className="onboarding-text">{t('goal.body')}</p>
        {DAILY_GOAL_OPTIONS.map((minutes) => (
          <label
            key={minutes}
            className={`goal-option flex items-center gap-md p-lg ${minutes === value ? 'is-active' : ''}`}
          >
            <input
              type="radio"
              name="daily-goal"
              value={minutes}
              checked={minutes === value}
              onChange={() => onChange(minutes)}
              className="goal-option-input"
            />
            <span className="flex flex-col">
              <span className="goal-option-title">
                {t('goal.minutes', { count: minutes })}
              </span>
              <span className="goal-option-hint">
                {t(`goal.hint.${minutes}`)}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSaving}
      >
        {t('goal.confirm')}
      </button>
    </form>
  );
}
