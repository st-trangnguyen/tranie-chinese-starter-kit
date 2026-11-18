import { useId } from 'react';
import { useTranslation } from 'react-i18next';

interface PinyinVisibilitySettingProps {
  value: boolean;
}

export function PinyinVisibilitySetting({
  value,
}: PinyinVisibilitySettingProps) {
  const { t } = useTranslation('settings');
  const legendId = useId();

  return (
    <fieldset className="settings-group flex flex-col gap-md p-lg">
      <legend id={legendId} className="settings-group-label px-sm">
        {t('pinyin.label')}
      </legend>
      <input
        type="checkbox"
        role="switch"
        aria-labelledby={legendId}
        checked={value}
        readOnly
        className="settings-switch self-start"
      />
    </fieldset>
  );
}
