import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';

import { stacksValue } from '@common/stacks-utils';
import { LoadingRectangle } from '@components/loading-rectangle';
import {
  calculateFeeFromFeeRate,
  isTxSponsored,
  TransactionFormValues,
} from '@common/transactions/transaction-utils';
import { FeeRow } from '@components/fee-row/fee-row';
import { Estimations } from '@models/fees-types';
import { MinimalErrorMessage } from '@pages/sign-transaction/components/minimal-error-message';
import { useFeeEstimationsQuery } from '@query/fees/fees.hooks';
import {
  useEstimatedSignedTransactionByteLengthState,
  useLocalTransactionInputsState,
  useSerializedSignedTransactionPayloadState,
  useTxForSettingsState,
} from '@store/transactions/transaction.hooks';
import { useFeeEstimationsState } from '@store/transactions/fees.hooks';
import { DEFAULT_FEE_RATE } from '@common/constants';
import { useAnalytics } from '@common/hooks/analytics/use-analytics';

export function FeeForm(): JSX.Element | null {
  const { setFieldValue } = useFormikContext<TransactionFormValues>();
  const serializedSignedTransactionPayloadState = useSerializedSignedTransactionPayloadState();
  const estimatedSignedTxByteLength = useEstimatedSignedTransactionByteLengthState();
  const analytics = useAnalytics();
  const {
    data: feeEstimationsResp,
    isError,
    error,
    isLoading,
  } = useFeeEstimationsQuery(serializedSignedTransactionPayloadState, estimatedSignedTxByteLength);
  const [transaction] = useTxForSettingsState();
  const [, setTxData] = useLocalTransactionInputsState();
  const [feeEstimations, setFeeEstimations] = useFeeEstimationsState();

  console.log({ feeEstimationsResp, error });

  useEffect(() => {
    console.log({ isError });
    if (isError) {
      console.log('fee estimation failed');

      console.log(fee, 'setting fee estimations');
      // setTxData({ fee: fee.toString() });
    }
  }, [isError, setFeeEstimations, transaction]);

  const isSponsored = transaction ? isTxSponsored(transaction) : false;

  useEffect(() => {
    if (feeEstimationsResp && feeEstimationsResp.estimations) {
      void analytics.track('fee_estimation_success');
      setFeeEstimations(feeEstimationsResp.estimations);
      setFieldValue(
        'fee',
        stacksValue({
          fixedDecimals: true,
          value: feeEstimationsResp.estimations[Estimations.Middle].fee,
          withTicker: false,
        })
      );
      return;
    }
    if (feeEstimationsResp && feeEstimationsResp.estimations) {
      if (!transaction) return;
      void analytics.track('view_high_fee_warning');
      const fee = calculateFeeFromFeeRate(transaction, DEFAULT_FEE_RATE);
      setFeeEstimations([
        { fee: fee.multipliedBy(0.9).toNumber(), fee_rate: 0 },
        { fee: fee.toNumber(), fee_rate: 0 },
        { fee: fee.multipliedBy(1.1).toNumber(), fee_rate: 0 },
      ]);
    }
  }, [analytics, feeEstimationsResp, setFeeEstimations, setFieldValue, transaction]);

  return (
    <>
      {feeEstimationsResp ? (
        <FeeRow
          fieldName="fee"
          isSponsored={isSponsored}
          fallbackToCustomFee={isError || (!!feeEstimationsResp?.error && !feeEstimations.length)}
        />
      ) : (
        <LoadingRectangle height="32px" width="100%" />
      )}
      <MinimalErrorMessage />
    </>
  );
}
//  transaction?.auth?.authType === AuthType.Sponsored;
