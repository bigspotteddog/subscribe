var GoogleButton = GoogleButton || (function() {
  const settings = {
    googleButtonHtml: "../html/google-button.html",
    googleButtonId: "google_btn"
  }
  function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    const data = {
      email: responsePayload.email,
      name: responsePayload.name
    }
    RegistrationForm.saveRegisteredAs(JSON.stringify(data));
    RegistrationForm.postData(RegistrationForm.settings.notifyMeUrl, data);
  }

  function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  function initialize() {
    google.accounts.id.initialize({
      client_id: RegistrationForm.settings.googleClientId,
      callback: handleCredentialResponse
    });
    const parent = document.getElementById(settings.googleButtonId);
    google.accounts.id.renderButton(parent, { theme: "filled_blue" });
    google.accounts.id.prompt();
  }

  function load(targetElement) {
    fetch(settings.googleButtonHtml)
    .then(function (response) {
      return response.text()
    })
    .then(function (html) {
      document.getElementById(targetElement).innerHTML = html;
      initialize();
    })
    .catch(function (err) {
      console.log('Failed to fetch page: ', err);
    });
  }

  return {
    settings: settings,
    load: load
  }
})();