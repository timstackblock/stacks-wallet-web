import { logger } from '@shared/logger';

import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { useAppDetails } from '@app/common/hooks/auth/use-app-details';
import { Header } from '@app/components/header';
import { AccountPicker } from '@app/features/account-picker/accounts';
import { useAccounts } from '@app/store/accounts/account.hooks';
import { AccountPickerLayout } from '@app/features/account-picker/account-picker.layout';
import {
  sendRequestAccountResponseToTab,
  sendUserDeniesAccountRequest,
} from '@app/common/actions/send-request-account-response';

import { useAccountRequestSearchParams } from './use-account-request-search-params';
import { useEffect } from 'react';

export function AccountRequest() {
  const accounts = useAccounts();
  const { name: appName } = useAppDetails();

  const { tabId, id } = useAccountRequestSearchParams();

  useRouteHeader(<Header hideActions />);

  const returnAccountDetailsToApp = (index: number) => {
    if (!accounts) throw new Error('Cannot request account details with no account');

    if (!tabId || !id) {
      logger.error('Missing either tabId or uuid. Both values are necessary to respond to app');
      return;
    }

    sendRequestAccountResponseToTab({ tabId, id, account: accounts[index] });
    window.close();
  };

  const handleUnmount = () => {
    if (!tabId || !id) {
      logger.error('Missing either tabId or uuid. Both values are necessary to respond to app');
      return;
    }
    sendUserDeniesAccountRequest({ tabId, id });
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleUnmount);
    return () => window.removeEventListener('beforeunload', handleUnmount);
  }, []);

  return (
    <AccountPickerLayout appName={appName}>
      <AccountPicker
        onAccountSelected={index => returnAccountDetailsToApp(index)}
        selectedAccountIndex={null}
      />
    </AccountPickerLayout>
  );
}
