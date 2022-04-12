import { decodeToken } from 'jsontokens';
import type { TransactionPayload } from '@janniks-stacks/connect';

export function getPayloadFromToken(requestToken: string) {
  const token = decodeToken(requestToken);
  return token.payload as unknown as TransactionPayload;
}
