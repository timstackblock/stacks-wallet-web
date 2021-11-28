import React, { useState, useCallback } from 'react';
import { Button, Stack, StackProps } from '@stacks/ui';

import { useWallet } from '@common/hooks/use-wallet';
import { useChangeScreen } from '@common/hooks/use-change-screen';
import { RouteUrls } from '@common/types';
import { useOnboardingState } from '@common/hooks/auth/use-onboarding-state';
import { useAnalytics } from '@common/hooks/analytics/use-analytics';
import { Link } from '@components/link';
import { InitialPageSelectors } from '@tests/integration/initial-page.selectors';

export function InstalledActions(props: StackProps): JSX.Element {
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const { makeWallet } = useWallet();
  const { decodedAuthRequest } = useOnboardingState();
  const changeScreen = useChangeScreen();
  const analytics = useAnalytics();

  const register = useCallback(async () => {
    setIsCreatingWallet(true);
    await makeWallet();
    void analytics.track('generate_new_secret_key');
    if (decodedAuthRequest) {
      changeScreen(RouteUrls.SetPassword);
    }
  }, [makeWallet, analytics, decodedAuthRequest, changeScreen]);

  return (
    <Stack justifyContent="center" spacing="loose" textAlign="center" {...props}>
      <Button
        onClick={register}
        isLoading={isCreatingWallet}
        data-testid={InitialPageSelectors.SignUp}
        borderRadius="10px"
      >
        I'm new to Stacks
      </Button>
      <Link
        onClick={() => changeScreen(RouteUrls.SignIn)}
        data-testid={InitialPageSelectors.SignIn}
      >
        Sign in with Secret Key
      </Link>
    </Stack>
  );
}
