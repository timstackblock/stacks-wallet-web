import {
  AssetInfo,
  ClarityValue,
  FungibleConditionCode,
  NonFungibleConditionCode,
  PostConditionPrincipal,
  PostConditionType,
  StacksMessageType,
} from '@stacks/transactions';
import BN from 'bn.js';

export enum RouteUrls {
  AddAccount = '/sign-in/add-account',
  AddNetwork = '/add-network',
  ChooseAccount = '/connect/choose-account',
  Home = '/',
  Installed = '/',
  PopupHome = '/',
  PopupReceive = '/receive',
  PopupSend = '/send',
  RecoveryCode = '/sign-in/recover',
  RequestDiagnostics = '/request-diagnostics',
  SettingsKey = '/settings/secret-key',
  SignIn = '/sign-in',
  SignInInstalled = '/installed/sign-in',
  SignOutConfirm = '/sign-out',
  SetPassword = '/set-password',
  SignUp = '/sign-up',
  TransactionPopup = '/transaction',
  Username = '/username',
}

// TODO: clarify usage of password for local key encryption
export const DEFAULT_PASSWORD = 'password';

// Not currently exported from @stacks/transactions
export interface STXPostCondition {
  readonly type: StacksMessageType.PostCondition;
  readonly conditionType: PostConditionType.STX;
  readonly principal: PostConditionPrincipal;
  readonly conditionCode: FungibleConditionCode;
  readonly amount: BN;
}
export interface FungiblePostCondition {
  readonly type: StacksMessageType.PostCondition;
  readonly conditionType: PostConditionType.Fungible;
  readonly principal: PostConditionPrincipal;
  readonly conditionCode: FungibleConditionCode;
  readonly amount: BN;
  readonly assetInfo: AssetInfo;
}
export interface NonFungiblePostCondition {
  readonly type: StacksMessageType.PostCondition;
  readonly conditionType: PostConditionType.NonFungible;
  readonly principal: PostConditionPrincipal;
  readonly conditionCode: NonFungibleConditionCode;
  readonly assetInfo: AssetInfo;
  readonly assetName: ClarityValue;
}

export interface PaginatedResults<T> {
  limit: number;
  offset: number;
  total: number;
  results: T[];
}
