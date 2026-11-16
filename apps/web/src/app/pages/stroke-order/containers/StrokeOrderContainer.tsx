import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { StrokeOrderAnimation } from '@shared/components/StrokeOrderAnimation';
import { useStrokeOrder } from '../hooks/useStrokeOrder';

interface StrokeOrderScreenProps {
  character: string;
}

/** Một lần "mở màn" cho một chữ; container đổi `key` khi đổi chữ. */
function StrokeOrderScreen({ character }: StrokeOrderScreenProps) {
  const { t } = useTranslation('stroke-order');
  const { view } = useStrokeOrder(character);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <h1 className="stroke-order-title">{t('title')}</h1>
      {view.status === 'ready' && (
        <StrokeOrderAnimation
          character={view.character}
          strokeData={view.strokeData}
        />
      )}
    </main>
  );
}

/** Màn xem thứ tự nét của một chữ (S6.1), địa chỉ `/characters/:character?/stroke-order`. */
const StrokeOrderContainer = () => {
  const { character = '' } = useParams();
  return <StrokeOrderScreen key={character} character={character} />;
};

export default StrokeOrderContainer;
