import { focusWithin } from './focus-within';

/**
 * Mixin to apply focusable behavior to Element.
 * @param {Object} focusWithin `focusWithin` mixin  
 */
export const focusable = (baseElement) => class extends focusWithin(baseElement) {
  static get properties() {
    return {
      /**
       * Reflect tabindex attribute.
       */
      tabindex: {type: String, reflect: true}
    }
  }

  constructor() {
    super();
    this.tabindex = '0';
  }
}