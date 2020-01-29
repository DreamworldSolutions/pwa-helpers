import { focusWithin } from './focus-within';

/**
 * Mixin to apply focusable behavior to Element.
 *
 * Generally you can make any element focusable by adding an attribute `tabindex`. But, style for `:host(:focus)` isn't working for IE
 * Edge. So, this behavior actually extends `focusWithin` behavior. So, you can get everything ready to be worked. And that solution
 * works across all the browsers flawlessly.
 */
export const focusable = (baseElement) => class extends focusWithin(baseElement) {
  static get properties() {
    return {
      /**
       * Value for the `tabindex` attribute. 
       * Default value: `0`
       */
      tabindex: {type: String, reflect: true}
    }
  }

  constructor() {
    super();
    this.tabindex = '0';
  }
}