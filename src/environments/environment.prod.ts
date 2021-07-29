export const environment = {
  name: 'prod',
  production: true,
  baseUrl: 'https://cr-prod-tf-web-api.azurewebsites.net/api',
  get apiUrl() {
    return typeof window !== 'undefined' ? `${(window as any)._env_.API_URL}/api` : undefined;
  },
  application: {
    name: 'angular-starter',
    angular: 'Angular 10.0.8',
    bootstrap: 'Bootstrap 4.5.1',
    fontawesome: 'Font Awesome 5.14.0',
  },
  oauth: {
    get clientId() {
      return typeof window !== 'undefined' ? `${(window as any)._env_.OAUTH_CLIENT_ID}` : undefined;
    },
    get authority() {
      return typeof window !== 'undefined'
        ? `https://${(window as any)._env_.TENANT_NAME}.b2clogin.com/${
            (window as any)._env_.TENANT_NAME
          }.onmicrosoft.com/B2C_1A_license_signup_signin`
        : undefined;
    },
    get issuer() {
      return typeof window !== 'undefined'
        ? `https://${(window as any)._env_.TENANT_NAME}.b2clogin.com/${(window as any)._env_.TENANT_ID}/v2.0/`
        : undefined;
    },
    jwksUrlSuffix: '/discovery/v2.0/keys',
    loginUrlSuffix: '/oauth2/v2.0/authorize',
    tokenUrlSuffix: '/oauth2/v2.0/token',
    endSessionUrlPart: '/oauth2/v2.0/logout?oauthConsumerKey=',
    loginCallbackUrlSuffix: '/auth/oauth-callback',
    logoutCallbackUrlSuffix: '/auth/logout-callback',
    wellKnownUrlSuffix: '/v2.0/.well-known/openid-configuration',
  },
};
