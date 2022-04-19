import { FinishedTxPayload, SponsoredFinishedTxPayload } from '@stacks/connect';

export const MESSAGE_SOURCE = 'hiro-wallet' as const;

export const CONTENT_SCRIPT_PORT = 'content-script' as const;

export enum ExternalMethods {
  transactionRequest = 'transactionRequest',
  transactionResponse = 'transactionResponse',
  authenticationRequest = 'authenticationRequest',
  authenticationResponse = 'authenticationResponse',
}

export enum InternalMethods {
  RequestDerivedStxAccounts = 'RequestDerivedStxAccounts',
  ShareInMemoryKeyToBackground = 'ShareInMemoryKeyToBackground',
  RequestInMemoryKeys = 'RequestInMemoryKeys',
  RemoveInMemoryKeys = 'RemoveInMemoryKeys',
}

export type ExtensionMethods = ExternalMethods | InternalMethods;

interface BaseMessage {
  source: typeof MESSAGE_SOURCE;
  method: ExtensionMethods;
}

/**
 * Content Script <-> Background Script
 */
export interface Message<Methods extends ExtensionMethods, Payload = undefined>
  extends BaseMessage {
  method: Methods;
  payload: Payload;
}

//
// RPC Methods, SIP pending

export enum RpcMethods {
  stx_requestAccounts,
  stx_testAnotherMethod,
}

export type RpcMethodNames = keyof typeof RpcMethods;

interface RpcMessage<Method extends RpcMethodNames, Params = void> {
  id: string;
  method: Method;
  params?: Params;
}

type RequestAccounts = RpcMessage<'stx_requestAccounts'>;
type TestAction = RpcMessage<'stx_testAnotherMethod'>;

export type SupportedRpcMessages = RequestAccounts | TestAction;

// interface SupportedMessagesReturnTypeMap {
//   [RpcMethods.stx_requestAccounts]: { xxx: string };
//   [RpcMethods.stx_testAnotherMethod]: { yyy: string };
// }

// function xx<Method extends keyof SupportedMessagesReturnTypeMap >(): // method: RpcMethods
// SupportedMessagesReturnTypeMap[Method] {

// }

// xx('stx_requestAccounts');

//
// Deprecated methods
type AuthenticationRequestMessage = Message<ExternalMethods.authenticationRequest, string>;

export type AuthenticationResponseMessage = Message<
  ExternalMethods.authenticationResponse,
  {
    authenticationRequest: string;
    authenticationResponse: string;
  }
>;

type TransactionRequestMessage = Message<ExternalMethods.transactionRequest, string>;

export type TxResult = SponsoredFinishedTxPayload | FinishedTxPayload;

export type TransactionResponseMessage = Message<
  ExternalMethods.transactionResponse,
  {
    transactionRequest: string;
    transactionResponse: TxResult | string;
  }
>;

export type LegacyMessageFromContentScript =
  | AuthenticationRequestMessage
  | TransactionRequestMessage;

export type LegacyMessageToContentScript =
  | AuthenticationResponseMessage
  | TransactionResponseMessage;
