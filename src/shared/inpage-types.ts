/**
 * Inpage Script (Stacks Provider) <-> Content Script
 */
export enum DomEventName {
  authenticationRequest = 'stacksAuthenticationRequest',
  transactionRequest = 'stacksTransactionRequest',
  rpcRequest = 'stxRpcRequest',
}

export interface AuthenticationRequestEventDetails {
  authenticationRequest: string;
}

export type AuthenticationRequestEvent = CustomEvent<AuthenticationRequestEventDetails>;

export interface TransactionRequestEventDetails {
  transactionRequest: string;
}

export type TransactionRequestEvent = CustomEvent<TransactionRequestEventDetails>;
