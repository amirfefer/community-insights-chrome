import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SSO_ROUTES, SSO_CLIENT_ID, loadFedModules } from '../../utils/common';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import platformUrl from '../platformUrl';
import { OIDCSecured } from './OIDCSecured';
import AppPlaceholder from '../../components/AppPlaceholder';
import { postbackUrlSetup } from '../offline';

const OIDCProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<
    | {
        ssoUrl: string;
        microFrontendConfig: Record<string, any>;
      }
    | undefined
  >(undefined);
  async function setupSSO() {
    const {
      // ignore $schema from the data as it is an spec ref
      data: { $schema: ignore, ...data },
    } = await loadFedModules();
    try {
      const {
        chrome: {
          config: { ssoUrl },
        },
      } = data;
      setState({ ssoUrl: platformUrl(DEFAULT_SSO_ROUTES, ssoUrl), microFrontendConfig: data });
    } catch (error) {
      setState({ ssoUrl: platformUrl(DEFAULT_SSO_ROUTES), microFrontendConfig: data });
    }
  }
  useEffect(() => {
    // required for offline token generation
    postbackUrlSetup();
    setupSSO();
  }, []);

  const authProviderProps: AuthProviderProps = useMemo(
    () => ({
      client_id: SSO_CLIENT_ID,
      loadUserInfo: true,
      automaticSilentRenew: true,
      redirect_uri: `${window.location.origin}`,
      authority: state?.ssoUrl,
      monitorSession: true,
      extraQueryParams: {
        claims: JSON.stringify({
          id_token: {
            email: { essential: true },
            name: { essential: true },
            preferred_username: { essential: true },
            locale: { essential: true },
          },
        }),
      },
      metadata: {
        authorization_endpoint: `${state?.ssoUrl}Authorization`,
        token_endpoint: `${state?.ssoUrl}Token`,
        userinfo_endpoint: `${state?.ssoUrl}UserInfo`,
        jwks_uri: `${state?.ssoUrl}Jwks`,
        end_session_endpoint: `${state?.ssoUrl}Logout`,
      },
      // removes code_challenge query param from the url
      disablePKCE: true,
      response_mode: 'query',
      response_type: 'code',
      // response_mode: 'fragment',
      onSigninCallback: () => {
        const startUrl = new URL(window.location.href);
        // remove the SSO code params from the URL
        startUrl.hash = '';
        window.history.replaceState({}, document.title, startUrl);
      },
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    }),
    [state?.ssoUrl]
  );

  if (!state?.ssoUrl || !state?.microFrontendConfig) {
    return <AppPlaceholder />;
  }

  return (
    <AuthProvider {...authProviderProps}>
      <OIDCSecured ssoUrl={state.ssoUrl} microFrontendConfig={state.microFrontendConfig}>
        {children}
      </OIDCSecured>
    </AuthProvider>
  );
};

export default OIDCProvider;
