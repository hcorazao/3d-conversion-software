export const environment = {
  name: 'dev',
  production: false,
  baseUrl: 'http://localhost:4200',
  get apiUrl() {
    return 'https://cr-staging-tf-web-api.azurewebsites.net/api';
  },
  application: {
    name: 'angular-starter',
    angular: 'Angular 10.0.8',
    bootstrap: 'Bootstrap 4.5.1',
    fontawesome: 'Font Awesome 5.14.0',
  },
  oauth: {
    clientId: '594767b4-9933-46d0-93f5-1b22695820db',
    authority: 'https://cadrayb2c.b2clogin.com/cadrayb2c.onmicrosoft.com/B2C_1A_license_signup_signin',
    issuer: 'https://cadrayb2c.b2clogin.com/47b1ef5d-359b-40c6-89ac-85c73b28ecd2/v2.0/',
    jwksUrlSuffix: '/discovery/v2.0/keys',
    loginUrlSuffix: '/oauth2/v2.0/authorize',
    tokenUrlSuffix: '/oauth2/v2.0/token',
    endSessionUrlPart: '/oauth2/v2.0/logout?oauthConsumerKey=',
    loginCallbackUrlSuffix: '/auth/oauth-callback',
    logoutCallbackUrlSuffix: '/auth/logout-callback',
    wellKnownUrlSuffix: '/v2.0/.well-known/openid-configuration',
  },
};
