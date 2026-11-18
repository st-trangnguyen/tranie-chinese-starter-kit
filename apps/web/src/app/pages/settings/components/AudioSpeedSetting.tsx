import { useTranslation } from 'react-i18next';
import { AUDIO_SPEED_OPTIONS, type AudioSpeed } from '@csk/shared';

interface AudioSpeedSettingProps {
  value: AudioSpeed;
  onChange: (speed: AudioSpeed) => void;
}

export function AudioSpeedSetting({ value, onChange }: AudioSpeedSettingProps) {
  const { t } = useTranslation('settings');

  return (
    <fieldset className="settings-group flex flex-col gap-md p-lg">
      <legend className="settings-group-label px-sm">
        {t('audioSpeed.label')}
      </legend>
      {AUDIO_SPEED_OPTIONS.map((speed) => (
        <label
          key={speed}
          className={`settings-option flex items-center gap-md p-md ${speed === value ? 'is-active' : ''}`}
        >
          <input
            type="radio"
            name="default-audio-speed"
            value={speed}
            checked={speed === value}
            onChange={() => onChange(speed)}
            className="settings-option-input"
          />
          {t(`audioSpeed.options.${speed}`)}
        </label>
      ))}
    </fieldset>
  );
}
