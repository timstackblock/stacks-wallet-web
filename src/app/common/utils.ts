import type { ClipboardEvent } from 'react';
import BigNumber from 'bignumber.js';

import { KEBAB_REGEX, Network } from '@shared/constants';
import { StacksNetwork } from '@stacks/network';
import { BufferReader, deserializePostCondition, PostCondition } from '@stacks/transactions';

import { AssetWithMeta } from './asset-types';

function kebabCase(str: string) {
  return str.replace(KEBAB_REGEX, match => '-' + match.toLowerCase());
}

export function extractPhraseFromString(value: string) {
  const clean = value.trim();
  const words = clean.match(/\S+/g);
  if (words?.length) {
    return words
      .map(word => (word.match(/[^0-9]+/g) ? word : null))
      .filter(Boolean)
      .join(' ');
  } else {
    return clean;
  }
}

export function extractPhraseFromPasteEvent(event: ClipboardEvent) {
  const pasted = event.clipboardData.getData('Text');
  return extractPhraseFromString(pasted);
}

export function validateAndCleanRecoveryInput(value: string) {
  const cleaned = value.trim();
  // Base64 encoded encrypted phrase
  let cleanedEncrypted = cleaned.replace(/\s/gm, '');
  const isPossibleRecoveryKey = /^[a-zA-Z0-9\+\/]+=?$/.test(cleanedEncrypted);

  if (isPossibleRecoveryKey && cleanedEncrypted.slice(-1) !== '=') {
    // Append possibly missing equals sign padding
    cleanedEncrypted = `${cleanedEncrypted}=`;
  }
  if (cleanedEncrypted.length >= 108) {
    return {
      isValid: true,
      value: cleanedEncrypted,
    };
  }
  return { isValid: false, value };
}

export function makeTxExplorerLink(txid: string, chain: 'mainnet' | 'testnet', suffix = '') {
  return `https://explorer.stacks.co/txid/${txid}?chain=${chain}${suffix}`;
}

export function truncateString(str: string, maxLength: number) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + '...';
}

function getLetters(string: string, offset = 1) {
  return string.slice(0, offset);
}

export function getTicker(value: string) {
  let name = kebabCase(value);
  if (name.includes('-')) {
    const words = name.split('-');
    if (words.length >= 3) {
      name = `${getLetters(words[0])}${getLetters(words[1])}${getLetters(words[2])}`;
    } else {
      name = `${getLetters(words[0])}${getLetters(words[1], 2)}`;
    }
  } else if (name.length >= 3) {
    name = `${getLetters(name, 3)}`;
  }
  return name.toUpperCase();
}

export function postConditionFromString(postCondition: string): PostCondition {
  const reader = BufferReader.fromBuffer(Buffer.from(postCondition, 'hex'));
  return deserializePostCondition(reader);
}

function isUtf8(buf?: Buffer | Uint8Array): boolean {
  if (!buf) {
    return false;
  }
  let i = 0;
  const len = buf.length;
  while (i < len) {
    // UTF8-1 = %x00-7F
    if (buf[i] <= 0x7f) {
      i++;
      continue;
    }
    // UTF8-2 = %xC2-DF UTF8-tail
    if (buf[i] >= 0xc2 && buf[i] <= 0xdf) {
      // if(buf[i + 1] >= 0x80 && buf[i + 1] <= 0xBF) {
      if (buf[i + 1] >> 6 === 2) {
        i += 2;

        continue;
      } else {
        return false;
      }
    }
    // UTF8-3 = %xE0 %xA0-BF UTF8-tail
    // UTF8-3 = %xED %x80-9F UTF8-tail
    if (
      ((buf[i] === 0xe0 && buf[i + 1] >= 0xa0 && buf[i + 1] <= 0xbf) ||
        (buf[i] === 0xed && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x9f)) &&
      buf[i + 2] >> 6 === 2
    ) {
      i += 3;
      continue;
    }
    // UTF8-3 = %xE1-EC 2( UTF8-tail )
    // UTF8-3 = %xEE-EF 2( UTF8-tail )
    if (
      ((buf[i] >= 0xe1 && buf[i] <= 0xec) || (buf[i] >= 0xee && buf[i] <= 0xef)) &&
      buf[i + 1] >> 6 === 2 &&
      buf[i + 2] >> 6 === 2
    ) {
      i += 3;

      continue;
    }
    // UTF8-4 = %xF0 %x90-BF 2( UTF8-tail )
    //          %xF1-F3 3( UTF8-tail )
    //          %xF4 %x80-8F 2( UTF8-tail )
    if (
      ((buf[i] === 0xf0 && buf[i + 1] >= 0x90 && buf[i + 1] <= 0xbf) ||
        (buf[i] >= 0xf1 && buf[i] <= 0xf3 && buf[i + 1] >> 6 === 2) ||
        (buf[i] === 0xf4 && buf[i + 1] >= 0x80 && buf[i + 1] <= 0x8f)) &&
      buf[i + 2] >> 6 === 2 &&
      buf[i + 3] >> 6 === 2
    ) {
      i += 4;
      continue;
    }
    return false;
  }
  return true;
}

export const abbreviateNumber = (n: number) => {
  if (n < 1e3) return n.toString();
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(2) + 'K';
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(2) + 'M';
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(2) + 'B';
  if (n >= 1e12) return +(n / 1e12).toFixed(2) + 'T';
  return n.toString();
};

function isHex(hex: string): boolean {
  const regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(hex);
}

function cleanHex(hexWithMaybePrefix: string): string {
  if (hexWithMaybePrefix !== 'string') return hexWithMaybePrefix;
  return hexWithMaybePrefix.startsWith('0x')
    ? hexWithMaybePrefix.replace('0x', '')
    : hexWithMaybePrefix;
}

export function hexToBuff(hex: string): Buffer {
  return Buffer.from(cleanHex(hex), 'hex');
}

export function hexToHumanReadable(hex: string) {
  if (!isHex(hex)) return hex;
  const buff = hexToBuff(hex);
  if (isUtf8(buff)) return buff.toString('utf8');
  return `0x${hex}`;
}

// We need this function because the latest changes
// to `@stacks/network` had some undesired consequence.
// As `StacksNetwork` is a class instance, this is auto
// serialized when being passed across `postMessage`,
// from the developer's app, to the Hiro Wallet.
// `coreApiUrl` now uses a getter, rather than a prop,
// and `_coreApiUrl` is a private value.
// To support both `@stacks/network` versions a dev may be using
// we look for both possible networks defined
function getCoreApiUrl(network: StacksNetwork) {
  if (network.coreApiUrl) return network.coreApiUrl;
  if ((network as any)._coreApiUrl) return (network as any)._coreApiUrl;
}

export function findMatchingNetworkKey(
  txNetwork: StacksNetwork,
  networks: Record<string, Network>
) {
  if (!networks || !txNetwork) return;

  const developerDefinedApiUrl = getCoreApiUrl(txNetwork);

  const keys = Object.keys(networks);

  // first try to search for an _exact_ url match
  const exactUrlMatch = keys.find((key: string) => {
    const network = networks[key] as Network;
    return network.url === developerDefinedApiUrl;
  });
  if (exactUrlMatch) return exactUrlMatch;

  // else check for a matching chain id (testnet/mainnet)
  const chainIdMatch = keys.find((key: string) => {
    const network = networks[key] as Network;
    return network.url === developerDefinedApiUrl || network.chainId === txNetwork?.chainId;
  });
  if (chainIdMatch) return chainIdMatch;

  return null;
}

export const slugify = (...args: (string | number)[]): string => {
  const value = args.join(' ');

  return value
    .normalize('NFD') // split an accented letter in the base letter and the accent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, '-'); // separator
};

export function getUrlHostname(url: string) {
  return new URL(url).hostname;
}

function getUrlPort(url: string) {
  return new URL(url).port;
}

export function addPortSuffix(url: string) {
  const port = getUrlPort(url);
  return port ? `:${port}` : '';
}

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function with0x(value: string): string {
  return !value.startsWith('0x') ? `0x${value}` : value;
}

export function initBigNumber(num: string | number | BigNumber) {
  return BigNumber.isBigNumber(num) ? num : new BigNumber(num);
}

export function countDecimals(num: string | number | BigNumber) {
  const LARGE_NUMBER_OF_DECIMALS = 100;
  BigNumber.config({ DECIMAL_PLACES: LARGE_NUMBER_OF_DECIMALS });
  const amount = initBigNumber(num);
  const decimals = amount.toString(10).split('.')[1];
  return decimals ? decimals.length : 0;
}

export function pullContractIdFromIdentity(identifier: string) {
  return identifier.split('::')[0];
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isEmpty(value: Object) {
  return Object.keys(value).length === 0;
}

export function formatContractId(address: string, name: string) {
  return `${address}.${name}`;
}

export function getFullyQualifiedAssetName(asset?: AssetWithMeta) {
  return asset
    ? `${formatContractId(asset.contractAddress, asset.contractName)}::${asset.name}`
    : undefined;
}
