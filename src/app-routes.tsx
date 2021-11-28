import React, { Suspense, useCallback, useEffect } from 'react';

import { Route, Routes, useLocation } from 'react-router-dom';

import { MagicRecoveryCode } from '@pages/installed/magic-recovery-code';
import { Username } from '@pages/username';
import { ChooseAccount } from '@pages/choose-account/choose-account';
import { SignTransaction } from '@pages/sign-transaction/sign-transaction';
import { Installed } from '@pages/installed/installed';
import { InstalledSignIn } from '@pages/installed/sign-in';

import { PopupReceive } from '@pages/receive-tokens/receive-tokens';
import { AddNetwork } from '@pages/add-network/add-network';
import { SetPasswordPage } from '@pages/set-password';
import { SendTokensForm } from '@pages/send-tokens/send-tokens-form';

import { SaveSecretKey } from '@pages/save-secret-key/save-secret-key';
import { RouteUrls } from '@common/types';
import { useChangeScreen } from '@common/hooks/use-change-screen';
import { useWallet } from '@common/hooks/use-wallet';
import { useOnboardingState } from '@common/hooks/auth/use-onboarding-state';
import { useSaveAuthRequest } from '@common/hooks/auth/use-save-auth-request-callback';
import { Navigate } from '@components/navigate';
import { RequireAuth } from '@pages/require-auth';
import { AccountGateRoute } from '@pages/account-gate-route';
import { Unlock } from '@pages/unlock';
import { Home } from '@pages/home/home';
// import { useUpdateLastSeenStore } from '@store/wallet/wallet.hooks';
import { SignOutConfirmDrawer } from '@pages/sign-out-confirm/sign-out-confirm';
import { useAnalytics } from '@common/hooks/analytics/use-analytics';
import { useHasAllowedDiagnostics } from '@store/onboarding/onboarding.hooks';
import { AllowDiagnosticsFullPage } from '@pages/allow-diagnostics/allow-diagnostics';
import { SignedOut } from '@pages/signed-out/signed-out';

function PrivateRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path={RouteUrls.AddNetwork} element={<AddNetwork />} />
      <Route
        path={RouteUrls.ChooseAccount}
        element={
          <Suspense fallback={<></>}>
            <ChooseAccount />
          </Suspense>
        }
      />
      <Route path={RouteUrls.Home} element={<Home />}>
        <Route path={RouteUrls.Send}>
          <Suspense fallback={<></>}>
            <SendTokensForm />
          </Suspense>
        </Route>
        <Route path={RouteUrls.SignOutConfirm} element={<SignOutConfirmDrawer />} />
      </Route>
      <Route path={RouteUrls.Receive} element={<PopupReceive />} />
      <Route path={RouteUrls.SignTransaction}>
        <Suspense fallback={<></>}>
          <SignTransaction />
        </Suspense>
      </Route>
    </Routes>
  );
}

function PublicRoutes(): JSX.Element {
  const changeScreen = useChangeScreen();

  return (
    <Routes>
      <Route path={RouteUrls.Installed} element={<Installed />} />
      <Route path={RouteUrls.SaveSecretKey}>
        <SaveSecretKey onClose={() => changeScreen(RouteUrls.Home)} title="Your Secret Key" />
      </Route>
      <Route path={RouteUrls.SetPassword} element={<SetPasswordPage redirect />} />
      <Route path={RouteUrls.SignIn} element={<InstalledSignIn />} />
      <Route path={RouteUrls.SignUp} element={<Installed />} />
      <Route path={RouteUrls.SignedOut} element={<SignedOut />} />
      <Route path={RouteUrls.Unlock} element={<Unlock />} />
    </Routes>
  );
}

export function AppRoutes(): JSX.Element {
  const { pathname } = useLocation();
  const analytics = useAnalytics();
  useSaveAuthRequest();

  const [hasAllowedDiagnostics, _] = useHasAllowedDiagnostics();

  useEffect(() => {
    void analytics.page('view', `${pathname}`);
  }, [analytics, pathname]);

  return (
    <Routes>
      {/* TODO: Use a layout container route at highest level - remove PopupContainer */}
      <PublicRoutes />
      <RequireAuth>
        <PrivateRoutes />
      </RequireAuth>
    </Routes>
  );
}
