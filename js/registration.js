var RegistrationForm = RegistrationForm || (function() {
  const settings = {
    notifyMeUrl: "https://blog-service-391514.wm.r.appspot.com/notify-me",
    googleClientId: "154864473268-2nkn09qqmag5v5a173kh9pncsui6h1gv.apps.googleusercontent.com",
    youHaveBeenRegisteredTitle: "You have been registered!",
    youHaveBeenRegisteredMessage: "You have been registered for email notification when we post a new blog article.",
    registrationModalId: "registration-modal",
    registrationModalTitleId: "registration-modal-title",
    registrationModalMessageId: "registration-modal-message",
    registrationContainerClass: "registration",
    registrationFormId: "registration-form",
    registrationNameId: "registration-name",
    registrationEmailId: "registration-email",
    registrationButtonId: "registration-button",
    registeredAsContainerId: "registered-as",
    registeredAsQuerySelector: "registered-as a",
    localStorageRegisteredAsName: "registered-as",
    registrationFormHtml: "../html/registration-form.html",
    manualForm: false
  }

  function showMessage(title, message, onClose) {
    document.getElementById(settings.registrationModalTitleId).innerText = title;
    document.getElementById(settings.registrationModalMessageId).innerText = message;
    const modal = $('#' + settings.registrationModalId);
    modal.modal('show');

    if (onClose) {
      modal.on('hidden.bs.modal', function (e) {
        onClose.call();
        modal.off('hidden.bs.modal');
      });
    }
  }

  async function postData(url = "", data = {}) {
    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
      });
      
      if (response.status === 200) {
        const result = await response.json();
        saveRegisteredAs(JSON.stringify(result));
        showMessage(settings.youHaveBeenRegisteredTitle, settings.youHaveBeenRegisteredMessage);
        clearRegistrationForm();
        checkRegistered();
        return result;
      } else {
        throw new Error("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
    }      
  }

  function clearRegistrationForm() {
    document.getElementById(settings.registrationFormId).reset();
  }

  function addRegistrationButtonEvents(element) {
    element.addEventListener("click", function (ev) {
      ev.preventDefault();
      const data = {
        name: document.getElementById(settings.registrationNameId).value,
        email: document.getElementById(settings.registrationEmailId).value
      }
    
      if (data.name.trim().length === 0) {
        showMessage("Validation error!", "Name is required.", function () {
          document.getElementById(settings.registrationNameId).focus();
        });
        return;
      }
    
      if (data.email.trim().length === 0) {
        showMessage("Validation error!", "Email is required.", function () {
          document.getElementById(settings.registrationEmailId).focus();
        });
        return;
      }
    
      postData(settings.notifyMeUrl, data);
    });
  }

  function saveRegisteredAs(registeredAs) {
    localStorage.setItem(settings.localStorageRegisteredAsName, registeredAs);  
  }

  function readRegisteredAs() {
    return localStorage.getItem(settings.localStorageRegisteredAsName);
  }

  function getRegisteredAs() {
    let registeredAs = readRegisteredAs();
    if (!registeredAs) {
      return {};
    }
    return JSON.parse(registeredAs);
  }

  function addRegisteredAsEvents(element) {
    element.addEventListener("click", function (ev) {
      ev.preventDefault();
      setRegistrationFormValues(getRegisteredAs());
      showRegistration();
    });  
  }

  function setRegistrationFormValues(registeredAs) {
    document.getElementById(settings.registrationNameId).value = registeredAs.name;
    document.getElementById(settings.registrationEmailId).value = registeredAs.email;
  }

  function checkRegistered() {
    let registeredAs = getRegisteredAs();
    if (registeredAs.email) {
      setRegisteredAs(registeredAs);
      showRegisteredAs();
    } else {
      showRegistration();
    }
  }

  function getRegisteredAsLink() {
    return document.querySelector("#" + settings.registeredAsQuerySelector);  
  }

  function setRegisteredAs(registeredAs) {
    const registeredAsLink = getRegisteredAsLink();
    registeredAsLink.innerText = registeredAs.name;
    registeredAsLink.setAttribute("title", registeredAs.email);
  }

  function showRegistration() {
    const registrationElements = document.getElementsByClassName(settings.registrationContainerClass);
    for (let i = 0; i < registrationElements.length; i++) {
      registrationElements[i].classList.remove("d-none");
    }
    document.getElementById(settings.registeredAsContainerId).classList.add("d-none");
  }

  function showRegisteredAs() {
    document.getElementById(settings.registeredAsContainerId).classList.remove("d-none");  
    const registrationElements = document.getElementsByClassName(settings.registrationContainerClass);
    for (let i = 0; i < registrationElements.length; i++) {
      registrationElements[i].classList.add("d-none");
    }
  }

  function initialize() {
    const registeredAsLink = getRegisteredAsLink();
    addRegisteredAsEvents(registeredAsLink);

    const button = document.getElementById(settings.registrationButtonId);
    addRegistrationButtonEvents(button);

    checkRegistered();
  }

  function load(targetElement) {
    if (settings.manualForm) {
      initialize();
      return;
    }

    fetch(RegistrationForm.settings.registrationFormHtml)
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
    load: load,
    saveRegisteredAs: saveRegisteredAs,
    postData: postData,
    addRegistrationButtonEvents: addRegistrationButtonEvents
  }
})();