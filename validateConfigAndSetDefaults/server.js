const initPrint = require('./helpers/initPrint.js');

const genExpressApp = require('../genExpressApp.js');

module.exports = (oldConfig) => {
  const config = oldConfig;
  const print = initPrint(config.verbose);


  /*------------------------------------------------------------------------*/
  /*                               Express App                              */
  /*------------------------------------------------------------------------*/

  // "app" + "sessionSecret" + "cookieName" + "sessionMins"
  if (config.app) {
    print.variable('app', true, 'we will add any middleware and/or routes to your app');
    if (config.sessionSecret) {
      print.variable('sessionSecret', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    if (config.cookieName) {
      print.variable('cookieName', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    if (config.sessionMins) {
      print.variable('sessionMins', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    // Listeners
    if (config.onListenSuccess) {
      print.variable('onListenSuccess', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
    if (config.onListenFail) {
      print.variable('onListenFail', true, 'this will be ignored: we are not setting up your express app (it was included)');
    }
  } else {
    // No express app. We are generating one
    print.variable('app', false, 'we\'ll make an express app for you');

    if (config.sessionSecret) {
      print.variable('sessionSecret', true);
    } else {
      print.variable('sessionSecret', false, 'we\'ll create a random one for you');
    }
    if (config.cookieName) {
      print.variable('cookieName', true);
    } else {
      print.variable('cookieName', false, 'we\'ll create a random one for you');
    }
    if (config.sessionMins) {
      print.variable('sessionMins', true);
    } else {
      print.variable('sessionMins', false, 'we\'ll use 6 hours as your session');
    }

    // SSL
    const useSSL = (config.sslKey && config.sslCertificate);
    if (useSSL) {
      print.variable('sslKey', true, 'we will use your ssl key to secure the connection');
      print.variable('sslCertificate', true, 'we will use your ssl certificate to secure the connection');
      if (config.sslCA) {
        print.variable('sslCA', true, 'we will use your certificate authority chain to secure the connection');
      } else {
        print.variable('sslCA', false, 'you did not include a certificate authority chain');
      }
    } else {
      if (config.sslKey) {
        print.variable('sslKey', true, 'this will be ignored: both "sslKey" and "sslCertificate" must be included to enable ssl');
      }
      if (config.sslCertificate) {
        print.variable('sslCertificate', true, 'this will be ignored: both "sslKey" and "sslCertificate" must be included to enable ssl');
      }
      if (config.sslCA) {
        print.variable('sslCA', true, 'this will be ignored: both "sslKey" and "sslCertificate" must be included to enable ssl');
      }
    }

    // Listeners
    if (config.onListenSuccess) {
      print.variable('onListenSuccess', true, 'we will call this function if the server starts up successfuly');
    } else {
      print.variable('onListenSuccess', false, 'we will print a message to the console log when the server starts up successfully');
    }
    if (config.onListenFail) {
      print.variable('onListenFail', true, 'we will call this function if the server fails to start successfuly');
    } else {
      print.variable('onListenFail', false, 'we will print a message and the error to the console log when the server fails to start up successfully');
    }

    // Initialize app
    config.app = genExpressApp({
      sessionSecret: config.sessionSecret,
      cookieName: config.cookieName,
      sessionMins: config.sessionMins,
      sslKey: config.sslKey,
      sslCertificate: config.sslCertificate,
      sslCA: config.sslCA,
      verbose: config.verbose,
    });
  }

  /*------------------------------------------------------------------------*/
  /*                                   API                                  */
  /*------------------------------------------------------------------------*/

  // Server-side API
  if (config.disableServerSideAPI) {
    print.boolean('disableServerSideAPI', true, 'server-side api disabled: req.api will not be installed into any routes');
  } else {
    print.boolean('disableServerSideAPI', false, 'server-side api enabled: req.api will be installed into "routesWithAPI" routes');
  }

  // accessToken + canvasHost
  const apiEnabled = (
    !config.disableServerSideAPI
    || !config.disableClientSideAPI
  );
  if (apiEnabled) {
    if (config.accessToken) {
      print.variable('accessToken', true, 'if the current user is not authorized, we will use this access token');
    } else {
      print.variable('accessToken', false, 'we will always use the current user\'s access token');
    }
    if (config.canvasHost) {
      print.variable('canvasHost', true, 'if we don\'t know which canvas host the current user launched from, we will use this host');
    } else {
      config.canvasHost = 'canvas.instructure.com';
      print.variable('canvasHost', false, 'if we don\'t know which canvas host the current user launched from, we will use "canvas.instructure.com". That said, if the user launched via LTI, we\'ll know which canvas host they launched from');
    }
  } else {
    // API not enabled
    if (config.accessToken) {
      print.variable('accessToken', true, 'this will be ignored: the api is disabled (both disableServerSideAPI and disableClientSideAPI are truthy)');
    }
    if (config.canvasHost) {
      print.variable('canvasHost', true, 'this will be ignored: the api is disabled (both disableServerSideAPI and disableClientSideAPI are truthy)');
    }
  }

  // routesWithAPI
  if (config.routesWithAPI) {
    if (!config.disableServerSideAPI) {
      // server-side api enabled
      print.variable('routesWithAPI', true, 'we will automatically add req.api to the included routes. Also, if autorization is enabled, we will auto-refresh the user\'s access token when they visiting these routes (if their access token has expired)');
    } else {
      print.variable('routesWithAPI', true, 'this will be ignored: the server-side api is not enabled, so we have no routes with the api');
    }
  } else {
    if (!config.disableServerSideAPI) {
      // server-side api enabled
      config.routesWithAPI = ['*'];
      print.variable('routesWithAPI', false, 'we will automatically add req.api to all routes. Also, if autorization is enabled, we will auto-refresh the user\'s access token when they visiting these routes (if their access token has expired)');
    } else {
      print.variable('routesWithAPI', false, 'this is expected: the server-side api is disabled so we have no need for routesWithAPI');
    }
  }

  // API Caching
  if (config.cache) {
    // Custom cache
    print.variable('cache', true, 'you are using your own custom cache');
    if (config.cacheType) {
      print.variable('cacheType', true, 'this will be ignored: we are using your custom cache');
    }
  } else if (config.cacheType) {
    print.variable('cacheType', true, 'api caching is on');
    if (config.cacheType === 'memory') {
      print.subtitle('API results will be cached in memory.');
    } else if (config.cacheType === 'session') {
      print.subtitle('API results will be cached in the user\'s session.');
    } else {
      // Invalid cache type
      throw new Error('"cacheType" must be either \'memory\', \'session\', or not included.');
    }
  } else {
    print.variable('cacheType', false, 'caching is off');
    print.variable('cache', false, 'caching is off');
    print.subtitle('if you want to enable caching, set "cacheType" to \'memory\' or \'session\' or include your own cache as "cache"');
  }

  // API sendRequest
  if (config.sendRequest) {
    print.variable('sendRequest', true, 'you are overriding our default sendRequest function');
  } else {
    print.variable('sendRequest', false, 'we\'ll use the default axios-based request sender (recommended)');
  }

  // API defaultNumRetries
  if (config.defaultNumRetries) {
    if (config.disableServerSideAPI) {
      print.variable('defaultNumRetries', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      print.variable('defaultNumRetries', true, 'we\'ll retry failed requests as many times as you specified');
    }
  } else if (config.defaultNumRetries === 0) {
    if (config.disableServerSideAPI) {
      print.variable('defaultNumRetries', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      print.variable('defaultNumRetries', true, 'we will not retry failed requests (you set "defaultNumRetries" to 0)');
    }
  } else {
    if (config.disableServerSideAPI) {
      print.variable('defaultNumRetries', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      // Set defaultNumRetries to 3
      config.defaultNumRetries = 3;
      print.variable('defaultNumRetries', false, `we'll retry failed requests ${config.defaultNumRetries} time(s)`);
    }
  }

  // API defaultItemsPerPage
  if (config.defaultItemsPerPage) {
    if (config.disableServerSideAPI) {
      print.variable('defaultItemsPerPage', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      print.variable('defaultItemsPerPage', true, 'we\'ll include this many items per page in GET requests');
    }
  } else {
    if (config.disableServerSideAPI) {
      print.variable('defaultItemsPerPage', true, 'this will be ignored: the server-side api is disabled. If you\'re trying to configure this for the client-side api, you should include this option when configuring the client-side instance of CACCL');
    } else {
      // Set defaultItemsPerPage to 100
      config.defaultItemsPerPage = 100;
      print.variable('defaultItemsPerPage', false, `we'll include ${config.defaultItemsPerPage} item(s) per page in GET requests`);
    }
  }

  /*------------------------------------------------------------------------*/
  /*                   API Forwarding and Client-side API                   */
  /*------------------------------------------------------------------------*/

  // Client-side API
  if (config.disableClientSideAPI) {
    print.boolean('disableClientSideAPI', true, 'client-side api disabled: the server will not forward requests from the client to Canvas');
  } else {
    print.boolean('disableClientSideAPI', false, 'client-side api enabled: the server will forward requests from the client to Canvas');
  }

  // apiForwardPathPrefix
  if (config.apiForwardPathPrefix) {
    if (config.disableClientSideAPI) {
      print.variable('apiForwardPathPrefix', true, 'this will be ignored: we have no need for an apiForwardPathPrefix when client-side api (and thus, api forwarding) are disabled');
    } else {
      print.variable('apiForwardPathPrefix', true, 'we will use your "apiForwardPathPrefix" when forwarding requests from the client to Canvas. Remember to include the same "apiForwardPathPrefix" in the config for the client-side instance of CACCL');
    }
  } else {
    if (config.disableClientSideAPI) {
      print.variable('apiForwardPathPrefix', true, 'this is expected: we have no need for an apiForwardPathPrefix when client-side api (and thus, api forwarding) are disabled');
    } else {
      config.apiForwardPathPrefix = '/canvas';
      print.variable('apiForwardPathPrefix', false, `we will use '${config.apiForwardPathPrefix}' when forwarding requests from the client to Canvas. Remember that the client should have the same "apiForwardPathPrefix": either exclude "apiForwardPathPrefix" from the client-side config for CACCL or set "apiForwardPathPrefix" to '${config.apiForwardPathPrefix}'`);
    }
  }

  /*------------------------------------------------------------------------*/
  /*                              Authorization                             */
  /*------------------------------------------------------------------------*/

  // disableAuthorization
  if (apiEnabled) {
    // API is enabled. We probably need authorization
    if (config.disableAuthorization) {
      // We don't have authorization. The programmer will need to manually add
      // access tokens
      if (config.accessToken) {
        print.boolean('disableAuthorization', true, 'warning: the api is enabled but authorization is disabled, so the default access token you included ("accessToken") will be used unless you manually authorize users. You can manually authorize a user by adding users\' access tokens to their session: req.session.accessToken');
      } else {
        print.boolean('disableAuthorization', true, 'warning: the api is enabled but authorization is disabled, so you will need to manually authorize users. You can do this by adding users\' access tokens to req.session.accessToken');
      }
    } else {
      print.boolean('disableAuthorization', false, 'this is the recommended value: the api is enabled and authorization is enabled so users can be authorized for api access');
    }
  } else {
    // The API is disabled. We have no need for authorization
    if (config.disableAuthorization) {
      print.boolean('disableAuthorization', true, 'this is the recommended value: the api is disabled so we don\'t need authorization enabled unless you plan on manually using users\' access tokens in your own code while not using our CACCL api functionality (access tokens are added as req.session.accessToken)');
    } else {
      print.boolean('disableAuthorization', false, 'though the api is disabled, authorization is still enabled. This is only useful if you plan on manually using users\' access tokens in your own code while not using our CACCL api functionality (access tokens are added as req.session.accessToken)');
    }
  }

  // authorizePath
  if (config.authorizePath) {
    // Included
    if (config.disableAuthorization) {
      // Authorization disabled
      print.variable('authorizePath', true, 'this will be ignored: authorize path is not relevant when authorization is disabled');
    } else {
      print.variable('authorizePath', true, 'when the user visits your defined "authorizePath", they will be authorized');
    }
  } else {
    // Excluded
    if (config.disableAuthorization) {
      // No path and no authorization
      print.variable('authorizePath', false, 'this is as expected: authorization path is not relevant when authorization is disabled');
    } else {
      // No path but performing authorizations, set up authorizePath
      config.authorizePath = '/authorize';
      print.variable('authorizePath', false, `we will use '${config.authorizePath}' for the authorizePath`);
    }
  }

  // defaultAuthorizedRedirect
  if (config.defaultAuthorizedRedirect) {
    // Redirect included
    if (config.disableAuthorization) {
      // Authorization disabled
      print.boolean('defaultAuthorizedRedirect', true, 'this will be ignored: authorization is disabled so we don\'t need a "defaultAuthorizedRedirect"');
    } else {
      // Authorization enabled
      print.boolean('defaultAuthorizedRedirect', true, 'we will use your redirect path');
    }
  } else {
    // Redirect not included (use default)
    if (config.disableAuthorization) {
      // Authorization disabled
      print.boolean('defaultAuthorizedRedirect', false, 'this is expected: authorization is disabled so we don\'t need a "defaultAuthorizedRedirect"');
    } else {
      // Authorization enabled
      config.defaultAuthorizedRedirect = `${config.authorizePath}/done`;
      print.boolean('defaultAuthorizedRedirect', false, `we will use '${config.defaultAuthorizedRedirect}' as your "defaultAuthorizedRedirect"`);
    }
  }

  // tokenStore
  if (config.tokenStore) {
    if (config.disableAuthorization) {
      // Not authorizing so the tokenStore is irrelevant
      print.variable('tokenStore', true, 'this will be ignored: authorization is disabled so we have no need for a token store');
    } else {
      print.variable('tokenStore', true, 'we will use your custom token store');
    }
  } else if (config.tokenStore === null) {
    // No token store
    if (config.disableAuthorization) {
      print.variable('tokenStore', false, 'this is expected: no token store is required if authorization is turned off');
    } else {
      print.variable('tokenStore', false, 'we will not store refresh tokens for future sessions, we will only store tokens in the current session. Thus, the user will need to re-authorize every time they launch your app');
    }
  } else {
    // Using a memory store
    if (config.disableAuthorization) {
      print.variable('tokenStore', false, 'this is expected: authorization is disabled so we have no need for a token store');
    } else {
      print.variable('tokenStore', false, 'we will use a memory store for refresh tokens');
    }
  }

  // Developer credentials
  const needDevCredentials = (apiEnabled && !config.disableAuthorization);
  if (needDevCredentials) {
    if (config.developerCredentials) {
      if (config.verbose) {
        print.variable('developerCredentials', true, 'we\'ll use these credentials in our authorization process');
      }
    } else {
      // Need developerCredentials but don't have them
      throw new Error('"developerCredentials" required. API is enabled (either disableClientSideAPI or disableServerSideAPI is falsy) and authorization is on (disableAuthorization is falsy). Thus, we need to be able to authorize. This is only possible with "developerCredentials".');
    }
  } else {
    if (config.developerCredentials) {
      // Don't need credentials but they were included
      if (config.verbose) {
        print.variable('developerCredentials', false, 'this will be ignored: either authorization or api is off, so we don\'t need credentials');
      }
    } else {
      if (config.verbose) {
        print.variable('developerCredentials', false, 'this is fine because we don\'t need credentials: either authorization or api is off, so we don\'t need credentials');
      }
    }
  }

  /*------------------------------------------------------------------------*/
  /*                                   LTI                                  */
  /*------------------------------------------------------------------------*/

  // disableLTI
  if (config.disableLTI) {
    print.variable('disableLTI', true, 'LTI features will be disabled');
  } else {
    print.variable('disableLTI', false, 'LTI features will be enabled: we will accept and parse LTI launches');
  }

  // installationCredentials
  if (config.installationCredentials) {
    if (config.disableLTI) {
      print.variable('installationCredentials', true, 'this will be ignored: we have no need for "installationCredentials" when LTI is disabled');
    } else {
      print.variable('installationCredentials', true, 'we will use your "installationCredentials" to verify the authenticity of LTI launch requests');
    }
  } else {
    if (config.disableLTI) {
      print.variable('installationCredentials', false, 'this is expected: we have no need for "installationCredentials" when LTI is disabled');
    } else {
      throw new Error('"installationCredentials" are required when LTI is enabled: we need the installationCredentials to be able to verify the authenticity of LTI launch requests');
    }
  }

  // launchPath
  if (config.launchPath) {
    if (config.disableLTI) {
      print.variable('launchPath', true, 'this will be ignored: we have no need for a launch path when LTI is disabled');
    } else {
      print.variable('launchPath', true, 'we will accept LTI launches at your launch path');
    }
  } else {
    if (config.disableLTI) {
      print.variable('launchPath', false, 'this is expected: we have no need for a launch path when LTI is disabled');
    } else {
      config.launchPath = '/launch';
      print.variable('launchPath', false, `we will accept launches at '${config.launchPath}'`);
    }
  }

  // redirectToAfterLaunch
  if (config.redirectToAfterLaunch) {
    if (config.disableLTI) {
      print.variable('redirectToAfterLaunch', true, 'this will be ignored: we have no need for a redirect path when LTI is disabled');
    } else {
      print.variable('redirectToAfterLaunch', true, 'we will redirect to this path upon a successful LTI launch');
    }
  } else {
    if (config.disableLTI) {
      print.variable('redirectToAfterLaunch', false, 'this is expected: we have no need for a redirect path when LTI is disabled');
    } else {
      config.redirectToAfterLaunch = config.launchPath;
      print.variable('redirectToAfterLaunch', false, `we will redirect the user to '${config.redirectToAfterLaunch}' upon a successful LTI launch`);
    }
  }

  // nonceStore
  if (config.nonceStore) {
    if (config.disableLTI) {
      print.variable('nonceStore', true, 'this will be ignored: we have no need for a nonce store if LTI is disabled');
    } else {
      print.variable('nonceStore', true, 'we will use your custom nonce store to keep track of nonces');
    }
  } else {
    if (config.disableLTI) {
      print.variable('nonceStore', false, 'this is expected: we have no need for a nonce store when LTI is disabled');
    } else {
      print.variable('nonceStore', false, 'we will use a memory nonce store');
    }
  }

  // authorizeOnLaunch
  if (config.authorizeOnLaunch) {
    if (!config.disableLTI && !config.disableAuthorization) {
      print.boolean('authorizeOnLaunch', true, 'we will automatically authorize the user upon an LTI launch');
    } else {
      print.boolean('authorizeOnLaunch', true, 'this will be ignored: we cannot authorize on launch if LTI or authorization are disabled');
    }
  } else {
    if (!config.disableLTI && !config.disableAuthorization) {
      print.boolean('authorizeOnLaunch', false, `users will not be automatically authorized on launch. Do manually authorize a user, direct them to the authorize path: '${config.authorizePath}'`);
    } else {
      print.boolean('authorizeOnLaunch', false, 'this is expected: we cannot authorize on launch if LTI or authorization are disabled');
    }
  }

  return config;
};