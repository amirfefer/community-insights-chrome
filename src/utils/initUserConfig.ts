import axios from 'axios';
import { initializeVisibilityFunctions } from './VisibilitySingleton';
import { ChromeUser } from '@redhat-cloud-services/types';

export type ChromeUserConfig = {
  data: {
    uiPreview: boolean;
    uiPreviewSeen: boolean;
  };
};

export const initChromeUserConfig = async ({ getUser, token }: { getUser: () => Promise<ChromeUser>; token: string }) => {
  const { data } = await axios.get<ChromeUserConfig>('/api/chrome-service/v1/user', {
    params: {
      'skip-identity-cache': 'true',
    },
  });
  const config = data;

  initializeVisibilityFunctions({
    getUser,
    getToken: () => Promise.resolve(token),
    getUserPermissions: () => Promise.resolve([]),
    isPreview: config.data.uiPreview,
  });

  return config;
};
