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
import { AccountGate } from '@pages/old-account-gate';
import { AccountGateRoute } from '@pages/account-gate-route';
import { Unlock } from '@pages/unlock';
import { Home } from '@pages/home/home';
// import { useUpdateLastSeenStore } from '@store/wallet/wallet.hooks';
import { SignOutConfirmDrawer } from '@pages/sign-out-confirm/sign-out-confirm';
import { useAnalytics } from '@common/hooks/analytics/use-analytics';
import { useHasAllowedDiagnostics } from '@store/onboarding/onboarding.hooks';
import { AllowDiagnosticsFullPage } from '@pages/allow-diagnostics/allow-diagnostics';

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
        <Route path={RouteUrls.SignOut} element={<SignOutConfirmDrawer />} />
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
      <Route path={RouteUrls.Unlock} element={<Unlock />} />
    </Routes>
  );
}

export function AppRoutes(): JSX.Element {
  const { isSignedIn: signedIn, encryptedSecretKey } = useWallet();
  const { isOnboardingInProgress } = useOnboardingState();
  const { search, pathname } = useLocation();
  // const setLastSeen = useUpdateLastSeenStore();

  const changeScreen = useChangeScreen();
  const analytics = useAnalytics();
  useSaveAuthRequest();

  const isSignedIn = signedIn && !isOnboardingInProgress;
  const isLocked = !signedIn && encryptedSecretKey;
  const [hasAllowedDiagnostics, _] = useHasAllowedDiagnostics();

  // TODO: Is this being used to track anything now that we have analytics?
  // Keep track of 'last seen' by updating it whenever a route is set.
  // useEffect(() => {
  //   setLastSeen(new Date().getTime());
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pathname]);

  useEffect(() => {
    void analytics.page('view', `${pathname}`);
  }, [analytics, pathname]);

  // const getHomeComponent = useCallback(() => {
  //   if (hasAllowedDiagnostics === undefined) return <AllowDiagnosticsFullPage />;
  //   if (isSignedIn || encryptedSecretKey) {
  //     return (
  //       <AccountGate>
  //         <Home />
  //       </AccountGate>
  //     );
  //   }
  //   return <Installed />;
  // }, [hasAllowedDiagnostics, isSignedIn, encryptedSecretKey]);

  // const getSignInComponent = () => {
  //   if (isLocked) return <Unlock />;
  //   if (isSignedIn)
  //     return <Navigate to={RouteUrls.ChooseAccount} screenPath={RouteUrls.ChooseAccount} />;
  //   return <InstalledSignIn />;
  // };

  // const getSignUpElement = () => {
  //   if (isLocked) return <Unlock />;
  //   if (isSignedIn) {
  //     return (
  //       <Navigate to={`${RouteUrls.ChooseAccount}${search}`} screenPath={RouteUrls.ChooseAccount} />
  //     );
  //   }
  //   return <Installed />;
  // };

  return (
    <Routes>
      {/* <Route path={RouteUrls.Home} element={getHomeComponent()}>
        <Route path={RouteUrls.SignOutConfirm} element={<SignOutConfirmDrawer />} />
      </Route> */}
      {/* Installation */}
      {/* <Route path={RouteUrls.SignInInstalled} element={<InstalledSignIn />} /> */}
      {/* <AccountGateRoute path={RouteUrls.PopupHome}>
        <Home />
      </AccountGateRoute> */}
      {/* <AccountGateRoute path={RouteUrls.PopupSend}>
        <Suspense fallback={<></>}>
          <SendTokensForm />
        </Suspense>
      </AccountGateRoute>
      <AccountGateRoute path={RouteUrls.PopupReceive}>
        <PopupReceive />
      </AccountGateRoute> */}
      {/* <AccountGateRoute path={RouteUrls.SaveSecretKey}>
        <SaveYourKeyView onClose={() => changeScreen(RouteUrls.Home)} title="Your Secret Key" />
      </AccountGateRoute> */}
      {/* <Route path={RouteUrls.AddNetwork} element={<AddNetwork />} /> */}
      {/* <Route path={RouteUrls.SetPassword} element={<SetPasswordPage redirect />} /> */}
      {/* <Route path={RouteUrls.SignUp} element={getSignUpElement()} /> */}
      {/*Sign In*/}
      {/* <Route path={RouteUrls.SignIn} element={getSignInComponent()} /> */}
      {/* TODO: Is this still in use? */}
      {/* <Route path={RouteUrls.RecoveryCode} element={<MagicRecoveryCode />} /> */}
      {/* TODO: These render the same component but is this still used? */}
      {/* <Route path={RouteUrls.AddAccount} element={<Username />} />; */}
      {/* <Route path={RouteUrls.Username} element={<Username />} /> */}
      {/* <Route
        path={RouteUrls.ChooseAccount}
        element={
          <Suspense fallback={<></>}>
            <ChooseAccount />
          </Suspense>
        }
      /> */}
      {/* Transactions */}
      {/* <AccountGateRoute path={RouteUrls.SignTransaction}>
        <Suspense fallback={<></>}>
          <SignTransaction />
        </Suspense>
      </AccountGateRoute> */}
    </Routes>
  );
}
