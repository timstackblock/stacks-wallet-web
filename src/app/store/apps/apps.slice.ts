import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

interface AppDetails {
  domain: string;
}

const appsAdapter = createEntityAdapter<AppDetails>({
  selectId: entity => entity.domain,
});

export const appsSlice = createSlice({
  name: 'apps',
  initialState: appsAdapter.getInitialState(),
  reducers: {
    appConnected: appsAdapter.addOne,
  },
});
