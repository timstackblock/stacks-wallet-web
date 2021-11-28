import React, { useState } from 'react';
import { Navigate } from 'react-router';

import { useWallet } from '@common/hooks/use-wallet';
import { SetPasswordPage } from '@pages/set-password';
import { Unlock } from '@pages/unlock';
import { SaveSecretKey } from '@pages/save-secret-key/save-secret-key';
import { SignedOut } from '@pages/signed-out/signed-out';

enum Step {
  VIEW_KEY = 1,
  SET_PASSWORD = 2,
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  // const [step, setStep] = useState<Step>(Step.VIEW_KEY);
  const { hasRehydratedVault, hasSetPassword, isSignedIn, encryptedSecretKey } = useWallet();

  if (!hasRehydratedVault) return null;

  if (isSignedIn && hasSetPassword) return <>{children}</>;

  return <Navigate to="/" />;

  // TODO: This needs to happen using routes in the components
  // const needsToSetPassword = (isSignedIn || encryptedSecretKey) && !hasSetPassword;

  // if (needsToSetPassword) {
  //   if (step === Step.VIEW_KEY) {
  //     return <SaveSecretKey hideActions handleNext={() => setStep(Step.SET_PASSWORD)} />;
  //   } else if (step === Step.SET_PASSWORD) {
  //     return <SetPasswordPage />;
  //   }
  // }
  // if (!isSignedIn && encryptedSecretKey) {
  //   return <Unlock />;
  // }
  // return <SignedOut />;
}
