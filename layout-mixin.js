/**
 * Mixin to apply "mobile" attribute to the component.
 *
 * Intially "mobile" attribute will be set to `true` if viewport width is less than 768px else it will be false.
 * After connectedCallback, it's integrator will determine to update "mobile" property.
 */
export const layoutMixin = (baseElement) => class extends baseElement {
  static get properties() {
    return {
      /**
       * Initially it will be set based on
       */
      mobile: { type: Boolean, reflect: true }
    }
  }

  constructor() {
    super();
    this.mobile = window.innerWidth < 768;
  }
}