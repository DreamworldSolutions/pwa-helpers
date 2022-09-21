export const isElementAlreadyRegistered = (elName) => {
  var registeredElement;
  if (window.Polymer && Polymer.telemetry) {
    registeredElement = Polymer.telemetry.registrations.filter((el) => el.is == elName);

    if (registeredElement) {
      console.warn(elName, "is already registered as a custom polymer element.");
    }

    return !!registeredElement;
  }

  if (window && window.customElements) {
    registeredElement = window.customElements.get(elName);

    if (registeredElement) {
      console.warn(elName, "is already registered as a custom lit element.");
    }

    return !!registeredElement;
  }
};
