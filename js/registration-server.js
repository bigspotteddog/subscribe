var RegistrationForm = (function (incomingSettings) {
  function Builder(incomingSettings) {
    const defaultSettings = {
      targetElement: "registration-container",
      notifyMeUrl: "https://blog-service-391514.wm.r.appspot.com/notify-me",
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
      registrationFormPath: "../html/registration-form.html",
      manualForm: false
    }

    const formSettings = {};
    const forms = {};
    let settings;

    function withNewRegistrationForm(targetElement) {
      settings = Object.assign({}, defaultSettings, incomingSettings);
      settings.targetElement = targetElement;
      formSettings[targetElement] = settings;
      return exported;
    }

    function withTargetElement(targetElement) {
      settings.targetElement = targetElement;
      return exported;
    }

    function withNotifyMeUrl(notifyMeUrl) {
      settings.notifyMeUrl = notifyMeUrl;
      return exported;
    }

    function withYouHaveBeenRegisteredTitle(youHaveBeenRegisteredTitle) {
      settings.youHaveBeenRegisteredTitle = youHaveBeenRegisteredTitle;
      return exported;
    }

    function withYouHaveBeenRegisteredMessage(youHaveBeenRegisteredMessage) {
      settings.youHaveBeenRegisteredMessage = youHaveBeenRegisteredMessage;
      return exported;
    }

    function withRegistrationModalId(registrationModalId) {
      settings.registrationModalId = registrationModalId;
      return exported;
    }

    function withregistrationModalTitleId(registrationModalTitleId) {
      settings.registrationModalTitleId = registrationModalTitleId;
      return exported;
    }

    function withRegistrationModalMessageId(registrationModalMessageId) {
      settings.registrationModalMessageId = registrationModalMessageId;
      return exported;
    }

    function withRegistrationContainerClass(registrationContainerClass) {
      settings.registrationContainerClass = registrationContainerClass;
      return exported;
    }

    function withRegistrationNameId(registrationNameId) {
      settings.registrationNameId = registrationNameId;
      return exported;
    }

    function withRegistrationEmailId(registrationEmailId) {
      settings.registrationEmailId = registrationEmailId;
      return exported;
    }

    function withRegistrationButtonId(registrationButtonId) {
      settings.registrationButtonId = registrationButtonId;
      return exported;
    }

    function withRegisteredAsContainerId(registeredAsContainerId) {
      settings.registeredAsContainerId = registeredAsContainerId;
      return exported;
    }

    function withRegisteredAsQuerySelector(registeredAsQuerySelector) {
      settings.registeredAsQuerySelector = registeredAsQuerySelector;
      return exported;
    }

    function withLocalStorageRegisteredAsName(localStorageRegisteredAsName) {
      settings.localStorageRegisteredAsName = localStorageRegisteredAsName;
      return exported;
    }

    function withManualForm(manualForm) {
      settings.manualForm = manualForm;
      return exported;
    }

    function create() {
      const keys = Object.keys(formSettings);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const settings = formSettings[key];
        const form = new Form(settings);
        forms[settings.targetElement] = form;
        form.load();
      }

      return {
        forms: forms
      }
    }

    const exported = {
      withNewRegistrationForm: withNewRegistrationForm,
      withGoogleButton: withGoogleButton,
      withTargetElement: withTargetElement,
      withNotifyMeUrl: withNotifyMeUrl,
      withYouHaveBeenRegisteredTitle: withYouHaveBeenRegisteredTitle,
      withYouHaveBeenRegisteredMessage: withYouHaveBeenRegisteredMessage,
      withRegistrationModalId: withRegistrationModalId,
      withregistrationModalTitleId: withregistrationModalTitleId,
      withRegistrationModalMessageId: withRegistrationModalMessageId,
      withRegistrationContainerClass: withRegistrationContainerClass,
      withRegistrationNameId: withRegistrationNameId,
      withRegistrationEmailId: withRegistrationEmailId,
      withRegistrationButtonId: withRegistrationButtonId,
      withRegisteredAsContainerId: withRegisteredAsContainerId,
      withRegisteredAsQuerySelector: withRegisteredAsQuerySelector,
      withLocalStorageRegisteredAsName: withLocalStorageRegisteredAsName,
      withManualForm: withManualForm,
      create: create
    };

    function Form(settings) {
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

            const event = new CustomEvent("subscribe-register-as", { detail: data });
            document.dispatchEvent(event);
            return result;
          } else {
            throw new Error("Something went wrong.");
          }
        } catch (error) {
          console.error(error);
        }
      }

      function clearForm() {
        document.getElementById(settings.registrationFormId).reset();
      }

      function addRegistrationButtonEvents(element) {
        if (!element) {
          return exported;
        }

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
        return exported;
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
        if (!element) {
          return;
        }
        element.addEventListener("click", function (ev) {
          ev.preventDefault();
          setRegisteredAsValues(getRegisteredAs());
          showRegistration();
        }, false);
      }

      function setRegisteredAsValues(registeredAs) {
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
        return exported;
      }

      function getRegisteredAsLink() {
        return document.querySelector("#" + settings.targetElement + " #" + settings.registeredAsQuerySelector);
      }

      function setRegisteredAs(registeredAs) {
        const registeredAsLink = getRegisteredAsLink();
        if (registeredAsLink) {
          registeredAsLink.innerText = registeredAs.name;
          registeredAsLink.setAttribute("title", registeredAs.email);
        }
        setRegisteredAsValues(registeredAs);
      }

      function showRegistration() {
        const registrationElements = document.getElementsByClassName(settings.registrationContainerClass);
        for (let i = 0; i < registrationElements.length; i++) {
          registrationElements[i].classList.remove("d-none");
        }
        document.getElementById(settings.registeredAsContainerId).classList.add("d-none");
      }

      function showRegisteredAs() {
        const container = document.getElementById(settings.registeredAsContainerId)

        if (container) {
          container.classList.remove("d-none");
          const registrationElements = document.getElementsByClassName(settings.registrationContainerClass);
          for (let i = 0; i < registrationElements.length; i++) {
            registrationElements[i].classList.add("d-none");
          }
        }
      }

      function initialize() {
        const registeredAsLink = getRegisteredAsLink();
        addRegisteredAsEvents(registeredAsLink);

        const button = document.getElementById(settings.registrationButtonId);
        addRegistrationButtonEvents(button);

        document.addEventListener('subscribe-register-as', function(ev) {
          checkRegistered();
        });

        checkRegistered();
      }

      function load() {
        if (settings.manualForm) {
          initialize();
          return exported;
        }

        fetch(settings.registrationFormPath)
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

      const exported = {
        settings: settings,
        load: load
      }

      return exported;
    }

    function withGoogleButton(googleSettings) {
      new GoogleButton()
        .withGoogleClientId("594987790606-if4vj0i12lg3etfimqsc71j0hdj23r0v.apps.googleusercontent.com")
        .withNotifyMeUrl(settings.notifyMeUrl)
        .withSaveRegisteredAsFunction(saveRegisteredAs)
        .withPostDataFunction(postData)
        .load();
      return exported;
    }

    return exported;
  }

  return {
    Builder: Builder
  }
});
