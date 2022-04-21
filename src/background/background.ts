//
// This file is the entrypoint to the extension's background script
// https://developer.chrome.com/docs/extensions/mv3/architecture-overview/#background_script
import * as Sentry from '@sentry/react';

import { RouteUrls } from '@shared/route-urls';
import { initSentry } from '@shared/utils/sentry-init';
import { logger } from '@shared/logger';
import {
  CONTENT_SCRIPT_PORT,
  LegacyMessageFromContentScript,
  RpcMethods,
  SupportedRpcMessages,
} from '@shared/message-types';

import { initContextMenuActions } from './init-context-menus';
import { internalBackgroundMessageHandler } from './message-handler';
import { backupOldWalletSalt } from './backup-old-wallet-salt';
import {
  handleLegacyExternalMethodFormat,
  inferLegacyMessage,
} from './legacy-external-message-handler';
import { popupCenter } from './popup-center';

initSentry();
initContextMenuActions();
backupOldWalletSalt();

const IS_TEST_ENV = process.env.TEST_ENV === 'true';

chrome.runtime.onInstalled.addListener(details => {
  Sentry.wrap(async () => {
    if (details.reason === 'install' && !IS_TEST_ENV) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL(`index.html#${RouteUrls.Onboarding}`),
      });
    }
  });
});

//
// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener(port =>
  Sentry.wrap(() => {
    if (port.name !== CONTENT_SCRIPT_PORT) return;

    port.onMessage.addListener(
      (message: LegacyMessageFromContentScript | SupportedRpcMessages, port) => {
        if (inferLegacyMessage(message)) {
          void handleLegacyExternalMethodFormat(message, port);
          return;
        }

        if (!port.sender?.tab?.id)
          return logger.error('Message reached background script without a corresponding tab');

        switch (message.method) {
          case RpcMethods[RpcMethods.stx_requestAccounts]: {
            const params = new URLSearchParams();
            params.set('tabId', port.sender.tab.id.toString());
            params.set('id', message.id);
            popupCenter({
              url: `/popup-center.html#${RouteUrls.AccountRequest}?${params.toString()}`,
            });
            break;
          }
        }
      }
    );
  })
);

//
// Events from the extension frames script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
  Sentry.wrap(() => {
    void internalBackgroundMessageHandler(message, sender, sendResponse);
    // Listener fn must return `true` to indicate the response will be async
    return true;
  })
);

if (IS_TEST_ENV) {
  // Expose a helper function to open a new tab with the wallet from tests
  (window as any).openOptionsPage = (page: string) => chrome.runtime.getURL(`index.html#${page}`);
}
