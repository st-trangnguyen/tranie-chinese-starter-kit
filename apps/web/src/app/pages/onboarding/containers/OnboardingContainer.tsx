import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import type { DailyGoalMinutes } from '@csk/shared';

import { FIRST_LESSON_ID, ROUTE_PATHS } from '@core/constants/app.constants';
import { useInstallPrompt } from '@core/hooks/useInstallPrompt';
import { GoalStep } from '../components/GoalStep';
import { InstallHint } from '../components/InstallHint';
import { WelcomeStep } from '../components/WelcomeStep';
import { useOnboarding } from '../hooks/useOnboarding';

type Step = 'welcome' | 'goal' | 'install';

const FIRST_LESSON_PATH = ROUTE_PATHS.lesson(FIRST_LESSON_ID);

const OnboardingContainer = () => {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const { needsOnboarding, isSaving, hasError, completeOnboarding } =
    useOnboarding();
  const { isStandalone, canPrompt, isIos, promptInstall } = useInstallPrompt();
  const [step, setStep] = useState<Step>('welcome');
  const [goal, setGoal] = useState<DailyGoalMinutes>(15);

  if (needsOnboarding === null) {
    return null;
  }
  // S1.3 AC3: onboarding chỉ hiện một lần.
  if (!needsOnboarding && step === 'welcome') {
    return <Navigate replace to={FIRST_LESSON_PATH} />;
  }

  const goToFirstLesson = () => navigate(FIRST_LESSON_PATH, { replace: true });

  const handleConfirmGoal = async () => {
    const isSaved = await completeOnboarding(goal);
    if (!isSaved) {
      return;
    }
    if (isStandalone) {
      goToFirstLesson();
      return;
    }
    setStep('install');
  };

  const handleInstall = async () => {
    await promptInstall();
    goToFirstLesson();
  };

  return (
    <main className="onboarding mx-auto flex min-h-screen max-w-md flex-col justify-center gap-2xl p-xl">
      {step === 'welcome' && <WelcomeStep onNext={() => setStep('goal')} />}
      {step === 'goal' && (
        <GoalStep
          value={goal}
          isSaving={isSaving}
          onChange={setGoal}
          onConfirm={handleConfirmGoal}
        />
      )}
      {hasError && (
        <p role="alert" className="onboarding-error">
          {t('goal.error')}
        </p>
      )}
      {step === 'install' && (
        <InstallHint
          canPrompt={canPrompt}
          isIos={isIos}
          onInstall={handleInstall}
          onSkip={goToFirstLesson}
        />
      )}
    </main>
  );
};

export default OnboardingContainer;
