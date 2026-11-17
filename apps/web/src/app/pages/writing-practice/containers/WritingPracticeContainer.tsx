import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { ROUTE_PATHS } from '@core/constants/app.constants';
import { StrokeWritingPad } from '@shared/components/exercises/StrokeWritingPad';
import { WritingPracticeFeedback } from '../components/WritingPracticeFeedback';
import { useWritingPractice } from '../hooks/useWritingPractice';

interface WritingPracticeScreenProps {
  character: string;
}

/** Phần thân màn theo trạng thái tải dữ liệu nét. */
function WritingPracticeBody({ character }: WritingPracticeScreenProps) {
  const { t } = useTranslation(['writing-practice', 'common']);
  const { view, practice, padKey, retry, recordStrokeAttempt, restart } =
    useWritingPractice(character);

  const handleRetry = () => {
    retry();
  };

  const handleRestart = () => {
    restart();
  };

  if (view.status === 'error') {
    return (
      <div className="flex flex-col items-start gap-md">
        <p role="alert" className="writing-practice-message">
          {t('common:error.title')}
        </p>
        <button type="button" className="btn btn-primary" onClick={handleRetry}>
          {t('common:error.retry')}
        </button>
      </div>
    );
  }
  if (view.status === 'unavailable') {
    return <p className="writing-practice-message">{t('unavailable')}</p>;
  }
  if (view.status === 'ready' && practice) {
    return (
      <>
        <StrokeWritingPad
          key={padKey}
          character={view.character}
          strokeData={view.strokeData}
          practice={practice}
          onStrokeAttempt={recordStrokeAttempt}
        />
        <WritingPracticeFeedback
          character={view.character}
          practice={practice}
          onRestart={handleRestart}
        />
      </>
    );
  }
  return (
    <p role="status" className="writing-practice-message">
      {t('loading')}
    </p>
  );
}

/** Một lần "mở màn" cho một chữ; container đổi `key` khi đổi chữ. */
function WritingPracticeScreen({ character }: WritingPracticeScreenProps) {
  const { t } = useTranslation('writing-practice');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-xl p-xl">
      <h1 className="writing-practice-title">{t('title')}</h1>
      <Link
        to={ROUTE_PATHS.strokeOrder(character)}
        className="writing-practice-link self-start"
      >
        {t('strokeOrderLink')}
      </Link>
      <WritingPracticeBody character={character} />
    </main>
  );
}

/** Màn luyện viết theo nét của một chữ (S6.2), địa chỉ `/characters/:character/writing-practice`. */
const WritingPracticeContainer = () => {
  const { character = '' } = useParams();
  return <WritingPracticeScreen key={character} character={character} />;
};

export default WritingPracticeContainer;
