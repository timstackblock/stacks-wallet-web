import React, { memo } from 'react';
import { Stack } from '@stacks/ui';
import { PopupContainer } from '@components/popup/container';
import { Title, Body } from '@components/typography';
import { Header } from '@components/header';

import { InstalledActions } from './installed-actions';

function InstalledBase() {
  return (
    <PopupContainer header={<Header hideActions />} requestType="auth">
      <Stack spacing="extra-loose" flexGrow={1} justifyContent="center">
        <Stack width="100%" spacing="loose" textAlign="center" alignItems="center">
          <Title as="h1" fontWeight={500}>
            Hiro Wallet is installed
          </Title>
          <Body maxWidth="28ch">Are you new to Stacks or do you already have a Secret Key?</Body>
        </Stack>
        <InstalledActions />
      </Stack>
    </PopupContainer>
  );
}

export const Installed = memo(InstalledBase);
