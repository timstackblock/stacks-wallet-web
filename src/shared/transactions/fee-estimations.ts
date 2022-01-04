import {
  useConfigFeeEstimationsEnabled,
  useConfigFeeEstimationsMaxValues,
} from '@app/query/hiro-config/hiro-config.query';
import { DEFAULT_FEE_RATE } from '@shared/constants';
import { FeeEstimation } from '@shared/models/fees-types';
import { BigNumber } from 'bignumber.js';

const defaultFeeEstimationsMaxValues = [500000, 750000, 2000000];

export function useFeeEstimationsMaxValues() {
  // Get it first from the config
  const configFeeEstimationsEnabled = useConfigFeeEstimationsEnabled();
  const configFeeEstimationsMaxValues = useConfigFeeEstimationsMaxValues();
  // Only when the remote config file explicitly sets the maxValuesEnabled as false, we return no cap for fees
  if (configFeeEstimationsEnabled === false) return;
  return configFeeEstimationsMaxValues || defaultFeeEstimationsMaxValues;
}

export function getFeeEstimationsWithMaxValues(
  feeEstimations: FeeEstimation[],
  feeEstimationsMaxValues: number[] | undefined
) {
  return feeEstimations.map((feeEstimation, index) => {
    if (
      feeEstimationsMaxValues &&
      new BigNumber(feeEstimation.fee).isGreaterThan(feeEstimationsMaxValues[index])
    ) {
      return { fee: feeEstimationsMaxValues[index], fee_rate: 0 };
    } else {
      return feeEstimation;
    }
  });
}

function calculateFeeFromFeeRate(txBytes: number, feeRate: number) {
  return new BigNumber(txBytes).multipliedBy(feeRate);
}

const marginFromDefaultFeeDecimalPercent = 0.1;

export function getDefaultSimulatedFeeEstimations(estimatedByteLength: number): FeeEstimation[] {
  const fee = calculateFeeFromFeeRate(estimatedByteLength, DEFAULT_FEE_RATE);
  return [
    { fee: fee.multipliedBy(1 - marginFromDefaultFeeDecimalPercent).toNumber(), fee_rate: 0 },
    { fee: fee.toNumber(), fee_rate: 0 },
    { fee: fee.multipliedBy(1 + marginFromDefaultFeeDecimalPercent).toNumber(), fee_rate: 0 },
  ];
}
