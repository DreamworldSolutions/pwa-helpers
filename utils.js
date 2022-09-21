/**
 * Identifies whether a WebComponent with a name is already registered? Check is performed in both: customElements and Polymer.telemetry registries.
 * @param {String} elName - WebComponent name
 * @returns Boolean
 */

export const isElementAlreadyRegistered = (elName) => {
  var registeredElement;
  
  if (window && window.customElements) {
    registeredElement = window.customElements.get(elName);
    if (registeredElement) {
      return true;
    }
  }

  if (window.Polymer && Polymer.telemetry) {
    registeredElement = Polymer.telemetry.registrations.filter((el) => el.is == elName);

    if (registeredElement) {
      return true;
    }
  }

  return false;
};
