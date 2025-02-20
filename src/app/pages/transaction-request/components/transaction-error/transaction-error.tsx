import { memo, Suspense, useEffect } from 'react';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useTransactionError } from '@app/pages/transaction-request/hooks/use-transaction-error';

import {
  BroadcastErrorMessage,
  ExpiredRequestErrorMessage,
  FeeInsufficientFundsErrorMessage,
  IncorrectContractAddressMessage,
  NoContractErrorMessage,
  StxTransferInsufficientFundsErrorMessage,
  UnauthorizedRequestRedirect,
} from './error-messages';

export enum TransactionErrorReason {
  StxTransferInsufficientFunds = 1,
  FeeInsufficientFunds = 2,
  Generic = 3,
  BroadcastError = 4,
  Unauthorized = 5,
  NoContract = 6,
  ExpiredRequest = 7,
  InvalidContractAddress = 8,
}

const TransactionErrorSuspense = memo(() => {
  const reason = useTransactionError();
  const analytics = useAnalytics();

  useEffect(() => {
    if (!reason) return;
    void analytics.track('view_transaction_signing_error', {
      reason: TransactionErrorReason[reason].toLowerCase(),
    });
  }, [analytics, reason]);

  if (!reason) return null;

  switch (reason) {
    case TransactionErrorReason.NoContract:
      return <NoContractErrorMessage />;
    case TransactionErrorReason.InvalidContractAddress:
      return <IncorrectContractAddressMessage />;
    case TransactionErrorReason.StxTransferInsufficientFunds:
      return <StxTransferInsufficientFundsErrorMessage />;
    case TransactionErrorReason.BroadcastError:
      return <BroadcastErrorMessage />;
    case TransactionErrorReason.FeeInsufficientFunds:
      return <FeeInsufficientFundsErrorMessage />;
    case TransactionErrorReason.Unauthorized:
      return <UnauthorizedRequestRedirect />;
    case TransactionErrorReason.ExpiredRequest:
      return <ExpiredRequestErrorMessage />;
    default:
      return null;
  }
});

function TransactionErrorBase(): JSX.Element {
  return (
    <Suspense fallback={<></>}>
      <TransactionErrorSuspense />
    </Suspense>
  );
}

export const TransactionError = memo(TransactionErrorBase);
