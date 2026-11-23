import { useId } from 'react';
import { useTranslation } from 'react-i18next';

interface PinyinVisibilitySettingProps {
  value: boolean;
  onChange: (isVisible: boolean) => void;
}

export function PinyinVisibilitySetting({
  value,
  onChange,
}: PinyinVisibilitySettingProps) {
  const { t } = useTranslation('settings');
  const legendId = useId();

  return (
    <fieldset className="settings-group flex flex-col gap-md p-lg">
      <legend id={legendId} className="settings-group-label px-sm">
        {t('pinyin.label')}
      </legend>
      <div className="flex items-center gap-md">
        <input
          type="checkbox"
          role="switch"
          aria-labelledby={legendId}
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="settings-switch"
        />
        <span className="settings-switch-state">
          {value ? t('pinyin.on') : t('pinyin.off')}
        </span>
      </div>
    </fieldset>
  );
}
