import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { appsSlice } from './apps.slice';

export const appActions = appsSlice.actions;

export function useUserGrantsPermissionToAppDomain() {
  const dispatch = useDispatch();
  return useCallback(
    (domain: string) => {
      const host = new URL(domain).host;
      dispatch(appActions.appConnected({ domain: host }));
    },
    [dispatch]
  );
}
