import { DEFAULT_SSO_ROUTES } from '../utils/common';
import logger from './logger';
const log = logger('auth/platform.ts');

// add trailing slash if missing
function sanitizeUrl(url: string) {
  return `${url.replace(/\/$/, '')}/`;
}

// Parse through keycloak options routes
export default function platformUlr(env: typeof DEFAULT_SSO_ROUTES, configSsoUrl?: string) {
  if (configSsoUrl) {
    return sanitizeUrl(configSsoUrl);
  }

  const ssoEnv = Object.entries(env).find(([, { url }]) => url.includes(location.hostname));
  if (ssoEnv) {
    log(`SSO Url: ${ssoEnv?.[1].sso}`);
    log(`Current env: ${ssoEnv?.[0]}`);
    return sanitizeUrl(ssoEnv?.[1].sso);
  } else {
    log('SSO url: not found, defaulting to stage');
    return DEFAULT_SSO_ROUTES.stg.sso;
  }
}
