const auth0Service = (function () {
  let config = {};
  let auth0Client;
  let auth0Loaded = false;
  let initializationPromise = null;
  
  // Dynamically load Auth0 SDK if not already loaded
  const loadAuth0SDK = () => {
    return new Promise((resolve, reject) => {
      if (window.auth0 || auth0Loaded) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.1/auth0-spa-js.production.js';
      script.onload = () => {
        auth0Loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Auth0 SDK'));
      document.head.appendChild(script);
    });
  };
  
  const createAuth0Client = async () => {
    await loadAuth0SDK();
    return await auth0.createAuth0Client({
      domain: config.auth0Domain,
      clientId: config.clientId,
      authorizationParams: config.params
    });
  };
  
  // Ensure client is initialized before any operations
  const ensureInitialized = async () => {
    if (initializationPromise) {
      await initializationPromise;
    }
    if (!auth0Client) {
      throw new Error('Auth0 service not initialized. Call run() first.');
    }
  };
  
  const getToken = async () => {
    try {
      await ensureInitialized();
      return await auth0Client.getTokenSilently();
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  };
  
  const profile = async () => {
    try {
      await ensureInitialized();
      const isAuthenticated = await auth0Client.isAuthenticated();
      if (isAuthenticated) {
        const userProfile = await auth0Client.getUser();
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  };
  
  const checkLogin = async () => {
    try {
      await ensureInitialized();
      const isAuthenticated = await auth0Client.isAuthenticated();
      if (isAuthenticated) {
        return await profile();
      }
      return null;
    } catch (error) {
      console.error('Error checking login:', error);
      throw error;
    }
  };
  
  const login = async () => {
    try {
      await ensureInitialized();
      const isAuthenticated = await auth0Client.isAuthenticated();
      if (isAuthenticated) {
        const token = await getToken();
        return token;
      } else {
        throw new Error('Not authenticated');
      }
    } catch (err) {
      try {
        await auth0Client.loginWithRedirect({
          authorizationParams: {
            redirect_uri: config.redirectUri,
          },
        });
        // Note: This won't return anything as the page will redirect
      } catch (redirectError) {
        console.error('Error during login redirect:', redirectError);
        throw redirectError;
      }
    }
  };
  
  const signUp = async () => {
    try {
      await ensureInitialized();
      await auth0Client.loginWithRedirect({
        authorizationParams: {
          redirect_uri: config.redirectUri,
          screen_hint: "signup"
        },
      });
      // Note: This won't return anything as the page will redirect
    } catch (error) {
      console.error('Error during signup redirect:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await ensureInitialized();
      await auth0Client.logout({
        logoutParams: {
          returnTo: config.redirectUri
        }
      });
      // Note: This won't return anything as the page will redirect
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };
  
  const handleRedirect = async (callback) => {
    try {
      await waitForInitialization(); // Use this instead of ensureInitialized
      if (
        location.search.includes("state=") &&
        (location.search.includes("code=") ||
          location.search.includes("error="))
      ) {
        // A small delay can sometimes help with race conditions.
        await new Promise(resolve => setTimeout(resolve, 250)); 
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
      } else {
        if (config.autoLogin) {
          await checkLogin();
        }
      }
    } catch (error) {
      console.error('Error handling redirect:', error);
      throw error;
    }
  };
  
  // Make run() return a promise but also provide synchronous usage
  const run = function (configParam) {
    config = configParam;
    
    // Store the initialization promise
    initializationPromise = createAuth0Client().then(client => {
      auth0Client = client;
      return client;
    }).catch(error => {
      console.error('Failed to initialize Auth0 client:', error);
      throw error;
    });
    
    return initializationPromise;
  };
  
  // Provide a way to check if initialized
  const isInitialized = () => {
    return auth0Client !== undefined;
  };
  
  // Provide a way to wait for initialization
  const waitForInitialization = () => {
    return initializationPromise || Promise.resolve();
  };
  
  return {
    run: run,
    signUp: signUp,
    login: login,
    logout: logout,
    handleRedirect: handleRedirect,
    profile: profile,
    getToken: getToken,
    isInitialized: isInitialized,
    waitForInitialization: waitForInitialization
  };
})();

(async () => {
    await auth0Service.run({
        auth0Domain: "dev-b4abuxwyzw0h142d.us.auth0.com",
        clientId: "iTegX4oYdlmnlaCqs0YQa4xGvK3OiSeL",
        params: { audience: "https://api.everybodyelses.com" },
        redirectUri: "https://subscribe.nobodyelses.com",
        autoLogin: true
    });
})();

// Export for use in other modules (if using ES6 modules)
// export default auth0Service;
