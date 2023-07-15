var GoogleButton = (function (incomingSettings) {
  const defaultSettings = {
    googleClientId: "your google client id",
    notifyMeUrl: "your notify me url",
    targetElement: "google-button",
    googleButtonHtmlPath: "../html/google-button.html",
    googleButtonId: "google_btn",
    saveRegisteredAsFunction: undefined, // function
    postDataFunction: undefined, // function
  }

  const settings = Object.assign({}, defaultSettings, incomingSettings);

  function withTargetElement(targetElement) {
    settings.targetElement = targetElement;
    return exported;
  }

  function withGoogleClientId(googleClientId) {
    settings.googleClientId = googleClientId;
    return exported;
  }

  function withNotifyMeUrl(notifyMeUrl) {
    settings.notifyMeUrl = notifyMeUrl;
    return exported;
  }

  function withGoogleButtonHtmlPath(googleButtonHtmlPath) {
    settings.googleButtonHtmlPath = googleButtonHtmlPath;
    return exported;
  }

  function withSaveRegisteredAsFunction(saveRegisteredAsFunction) {
    settings.saveRegisteredAsFunction = saveRegisteredAsFunction;
    return exported;
  }

  function withPostDataFunction(postDataFunction) {
    settings.postDataFunction = postDataFunction;
    return exported;
  }

  function load() {
    fetch(settings.googleButtonHtmlPath)
      .then(function (response) {
        return response.text()
      })
      .then(function (html) {
        document.getElementById(settings.targetElement).innerHTML = html;
        initialize();
      })
      .catch(function (err) {
        console.log('Failed to fetch page: ', err);
      });
    return exported;
  }

  function initialize() {
    google.accounts.id.initialize({
      client_id: settings.googleClientId,
      callback: handleCredentialResponse
    });
    const parent = document.getElementById(settings.googleButtonId);
    google.accounts.id.renderButton(parent, { theme: "filled_blue" });
  }

  function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    const data = {
      email: responsePayload.email,
      name: responsePayload.name
    }
    settings.saveRegisteredAsFunction(JSON.stringify(data));
    settings.postDataFunction(settings.notifyMeUrl, data);
  }

  function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  const exported = {
    withTargetElement: withTargetElement,
    withGoogleClientId: withGoogleClientId,
    withNotifyMeUrl: withNotifyMeUrl,
    withGoogleButtonHtmlPath: withGoogleButtonHtmlPath,
    withSaveRegisteredAsFunction: withSaveRegisteredAsFunction,
    withPostDataFunction: withPostDataFunction,
    load: load,
    settings: settings
  }

  return exported;
});