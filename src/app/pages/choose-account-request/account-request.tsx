import { useEffect } from 'react';
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
import { useUserGrantsPermissionToAppDomain } from '@app/store/apps/apps.actions';

import { useAccountRequestSearchParams } from './use-account-request-search-params';

export function AccountRequest() {
  const accounts = useAccounts();
  const { name: appName } = useAppDetails();
  const grantDomainPermission = useUserGrantsPermissionToAppDomain();

  const { tabId, id, origin } = useAccountRequestSearchParams();

  useRouteHeader(<Header hideActions />);

  const returnAccountDetailsToApp = (index: number) => {
    if (!accounts) throw new Error('Cannot request account details with no account');

    if (!tabId || !id || !origin) {
      logger.error(
        'Missing necessary search param values. All values are necessary to respond to app'
      );
      return;
    }

    grantDomainPermission(origin);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
