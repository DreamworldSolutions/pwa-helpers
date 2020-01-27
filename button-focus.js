
import Bowser from "bowser";

export const buttonFocus = (baseElement) => class extends baseElement {

  constructor() {
    super();

    /**
     * Represent current browser name.
     */
    this.__browserName = undefined;

    /**
     * Represent current OS name.
     */
    this.__OSName = undefined;
  }

  static get properties() {
    return {

      /**
       * Current element is disabled or not.
       */
      disabled: { type: Boolean, reflect: true },

      /**
       * Button focus mixin is work or not.
       */
      buttonFocusDisabled: { type: Boolean },

      /**
       * Set tabindex for undisabled item.
       * Default value is 0(Zero).
       */
      tabindex: { type: Number }
    };
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    let bowser = Bowser.getParser(window.navigator.userAgent);
    this.__browserName = bowser.getBrowserName();
    this.__OSName = bowser.getOSName();
    this.tabindex = 0;
  }

  /**
   * Invoked each time one of the custom element's attributes is added, removed, or changed. 
   * Which attributes to notice change for is specified in a `static get observedAttributes` method.
   */
  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback && super.attributeChangedCallback(name, oldval, newval);
    if (name === 'disabled') {
      this._updateTabIndex();
    }
  }

  firstUpdated(changedProperties) {
    super.firstUpdated && super.firstUpdated(changedProperties);
    this._updateTabIndex();
  }

  updated(changedProperties) {
    super.updated && super.updated(changedProperties);

    if (changedProperties.has('disabled') || changedProperties.has('tabindex')) {
      this._updateTabIndex();
    }
  }

  disconnectedCallback() {
    this.__browserName = undefined;
    this.__OSName = undefined;
    super.disconnectedCallback && super.disconnectedCallback();
  }

  /**
   * When current browser is `Safari` OR current device is 'IOS' and current browser is `Chrome` then
   *  - When current el is diasbled then remove tabindex.
   *  - Otherwise set tab index.
   * @protected
   */
  _updateTabIndex(){
    if(this.buttonFocusDisabled) {
      return;
    }

    if ((this.__browserName === 'Safari') || (this.__OSName === 'iOS' && this.__browserName === 'Chrome')) {
      this._isDisabled() ? this._removeTabindex() : this._setTabindex();
    }
  }

  /**
   * Set `tabindex` attribute as a `tabindex` property.
   * @protected
   */
  _setTabindex() {
    this.setAttribute("tabindex", this.tabindex);
  }

  /**
   * Remove `tabindex` attribute.
   * @protected
   */
  _removeTabindex() {
    this.removeAttribute("tabindex");
  }

  /**
   * @returns {Boolean} `true` when current element is disabled. `false` otherwsie.
   * @protected
   */
  _isDisabled() {
    return this.disabled || this.getAttribute('disabled') !== null;
  }
}