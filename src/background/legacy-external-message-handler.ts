import { ExternalMethods, LegacyMessageFromContentScript } from '@shared/message-types';
import { RouteUrls } from '@shared/route-urls';
import { StorageKey, storePayload } from '@shared/utils/storage';
import { popupCenter } from './popup-center';

const IS_TEST_ENV = process.env.TEST_ENV === 'true';

//
// Playwright does not currently support Chrome extension popup testing:
// https://github.com/microsoft/playwright/issues/5593
async function openRequestInFullPage(path: string, urlParams: URLSearchParams) {
  await chrome.tabs.create({
    url: chrome.runtime.getURL(`index.html#${path}?${urlParams.toString()}`),
  });
}

export function inferLegacyMessage(message: any): message is LegacyMessageFromContentScript {
  // Now that we use a RPC communication style, we can infer
  // legacy message types by presence of an id
  const hasIdProp = 'id' in message;
  return !hasIdProp;
}

export async function handleLegacyExternalMethodFormat(
  message: LegacyMessageFromContentScript,
  port: chrome.runtime.Port
) {
  switch (message.method) {
    case ExternalMethods.authenticationRequest: {
      const { payload } = message;
      void storePayload({
        payload,
        storageKey: StorageKey.authenticationRequests,
        port,
      });
      const path = RouteUrls.Onboarding;
      const urlParams = new URLSearchParams();
      urlParams.set('authRequest', payload);
      if (IS_TEST_ENV) {
        await openRequestInFullPage(path, urlParams);
      } else {
        popupCenter({ url: `/popup-center.html#${path}?${urlParams.toString()}` });
      }
      break;
    }
    case ExternalMethods.transactionRequest: {
      const { payload } = message;

      void storePayload({
        payload,
        storageKey: StorageKey.transactionRequests,
        port,
      });
      const path = RouteUrls.TransactionRequest;
      const urlParams = new URLSearchParams();
      urlParams.set('request', payload);
      if (IS_TEST_ENV) {
        await openRequestInFullPage(path, urlParams);
      } else {
        popupCenter({ url: `/popup-center.html#${path}?${urlParams.toString()}` });
      }
      break;
    }
  }
}
