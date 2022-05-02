import { memo, useCallback, useEffect } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Stack } from '@stacks/ui';

import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { useFeeSchema } from '@app/common/validation/use-fee-schema';
import { LoadingKeys, useLoading } from '@app/common/hooks/use-loading';
import { useNextTxNonce } from '@app/common/hooks/account/use-next-tx-nonce';
import { HighFeeDrawer } from '@app/features/high-fee-drawer/high-fee-drawer';
import { PopupHeader } from '@app/pages/transaction-request/components/popup-header';
import { PageTop } from '@app/pages/transaction-request/components/page-top';
import { ContractCallDetails } from '@app/pages/transaction-request/components/contract-call-details/contract-call-details';
import { ContractDeployDetails } from '@app/pages/transaction-request/components/contract-deploy-details/contract-deploy-details';
import { PostConditions } from '@app/pages/transaction-request/components/post-conditions/post-conditions';
import { StxTransferDetails } from '@app/pages/transaction-request/components/stx-transfer-details/stx-transfer-details';
import { PostConditionModeWarning } from '@app/pages/transaction-request/components/post-condition-mode-warning';
import { TransactionError } from '@app/pages/transaction-request/components/transaction-error/transaction-error';
import { useIsDomainPreApproved } from '@app/store/apps/apps.actions';
import {
  useTransactionRequestState,
  useTransactionRequestValidation,
  useUpdateTransactionBroadcastError,
} from '@app/store/transactions/requests.hooks';
import {
  useLocalTransactionInputsState,
  useTransactionBroadcast,
} from '@app/store/transactions/transaction.hooks';
import { useFeeEstimationsState } from '@app/store/transactions/fees.hooks';

import { FeeForm } from './components/fee-form';
import { SubmitAction } from './components/submit-action';
import { useUnsignedTransactionFee } from './hooks/use-signed-transaction-fee';
import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { Estimations } from '@shared/models/fees-types';
import { ErrorMessage } from './components/transaction-error/error-message';
import { useTransactionValidator } from './hooks/use-transaction-validator';

function TransactionRequestBase(): JSX.Element | null {
  useNextTxNonce();
  const transactionRequest = useTransactionRequestState();
  const { setIsLoading, setIsIdle } = useLoading(LoadingKeys.SUBMIT_TRANSACTION);
  const handleBroadcastTransaction = useTransactionBroadcast();
  const setBroadcastError = useUpdateTransactionBroadcastError();
  const [, setFeeEstimations] = useFeeEstimationsState();
  const [, setTxData] = useLocalTransactionInputsState();
  const { isSponsored } = useUnsignedTransactionFee();
  const feeSchema = useFeeSchema();
  const analytics = useAnalytics();
  // const isValidTransaction = useTransactionRequestValidation();
  // const isDomainApproved = useIsDomainPreApproved();
  const txValidationResult = useTransactionValidator();

  const validationSchema = !isSponsored ? yup.object({ fee: feeSchema() }) : null;

  useRouteHeader(<PopupHeader />);

  useEffect(() => void analytics.track('view_transaction_signing'), [analytics]);

  const onSubmit = useCallback(
    async values => {
      // Using the same pattern here as is used in the send tokens
      // form, but maybe we can get rid of global form state when
      // we refactor transaction signing?
      setTxData({
        amount: '',
        fee: values.fee,
        memo: '',
        recipient: '',
      });
      setIsLoading();
      await handleBroadcastTransaction();
      setIsIdle();
      setFeeEstimations([]);
      void analytics.track('submit_fee_for_transaction', {
        type: values.feeType,
        fee: values.fee,
      });
      return () => {
        setBroadcastError(null);
        setTxData(null);
      };
    },
    [
      analytics,
      handleBroadcastTransaction,
      setBroadcastError,
      setFeeEstimations,
      setIsIdle,
      setIsLoading,
      setTxData,
    ]
  );

  if (!transactionRequest) return null;

  return (
    <Stack px={['loose', 'unset']} spacing="loose">
      <PageTop />
      <PostConditionModeWarning />
      <TransactionError />
      {/* {isValidTransaction ? null : (
        <ErrorMessage
          title="Unsigned transaction"
          body="This transaction has been made from an unsigned source"
        />
      )} */}
      <PostConditions />
      {transactionRequest.txType === 'contract_call' && <ContractCallDetails />}
      {transactionRequest.txType === 'token_transfer' && <StxTransferDetails />}
      {transactionRequest.txType === 'smart_contract' && <ContractDeployDetails />}
      <Formik
        initialValues={{ fee: '', feeType: Estimations[Estimations.Middle] }}
        onSubmit={onSubmit}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
        validationSchema={validationSchema}
      >
        {() => (
          <>
            <FeeForm />
            <SubmitAction />
            <HighFeeDrawer />
          </>
        )}
      </Formik>
    </Stack>
  );
}

export const TransactionRequest = memo(TransactionRequestBase);
