import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';
import { StrokeOrderAnimation } from '@shared/components/StrokeOrderAnimation';
import { StrokeOrderStatic } from '@shared/components/StrokeOrderStatic';
import { useStrokeOrder } from '../hooks/useStrokeOrder';

interface StrokeOrderScreenProps {
  character: string;
}

/** Phần thân màn theo trạng thái tải dữ liệu nét. */
function StrokeOrderBody({ character }: StrokeOrderScreenProps) {
  const { t } = useTranslation(['stroke-order', 'common']);
  const { view, retry, isReducedMotion } = useStrokeOrder(character);

  const handleRetry = () => {
    retry();
  };

  if (view.status === 'loading') {
    return (
      <p role="status" className="stroke-order-message">
        {t('loading')}
      </p>
    );
  }
  if (view.status === 'error') {
    return (
      <div className="flex flex-col items-start gap-md">
        <p role="alert" className="stroke-order-message">
          {t('common:error.title')}
        </p>
        <button type="button" className="btn btn-primary" onClick={handleRetry}>
          {t('common:error.retry')}
        </button>
      </div>
    );
  }
  if (view.status === 'unavailable') {
    return <p className="stroke-order-message">{t('unavailable')}</p>;
  }
  if (view.status === 'ready') {
    return (
      <>
        {isReducedMotion ? (
          <StrokeOrderStatic
            character={view.character}
            strokeData={view.strokeData}
          />
        ) : (
          <StrokeOrderAnimation
            character={view.character}
            strokeData={view.strokeData}
          />
        )}
        <Link
          to={ROUTE_PATHS.writingPractice(view.character)}
          className="btn btn-primary self-center"
        >
          {t('writingPractice')}
        </Link>
      </>
    );
  }
  return null;
}

/** Một lần "mở màn" cho một chữ; container đổi `key` khi đổi chữ. */
function StrokeOrderScreen({ character }: StrokeOrderScreenProps) {
  const { t } = useTranslation('stroke-order');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <h1 className="stroke-order-title">{t('title')}</h1>
      <StrokeOrderBody character={character} />
    </main>
  );
}

/** Màn xem thứ tự nét của một chữ (S6.1), địa chỉ `/characters/:character?/stroke-order`. */
const StrokeOrderContainer = () => {
  const { character = '' } = useParams();
  return <StrokeOrderScreen key={character} character={character} />;
};

export default StrokeOrderContainer;
