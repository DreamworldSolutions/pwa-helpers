import Bowser from "bowser";

export const focusWithin = (baseElement) => class extends baseElement {
  constructor() {
    super();
    this._setFocusWithin = this._setFocusWithin.bind(this);
    this._removeFocusWithin = this._removeFocusWithin.bind(this);
  }

  static get properties() {
    return {
      /**
       * Element is focused or not.
       */
      _focus: { type: Boolean, reflect: true, attribute: 'focus' },

      /**
       * Any child element has focus or not.
       */
      _focusWithin: { type: Boolean, reflect: true, attribute: 'focus-within' }
    };
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    let bowser = Bowser.getParser(window.navigator.userAgent);
    let __browserName = bowser.getBrowserName();
    if (__browserName !== 'Internet Explorer' && __browserName !== 'Microsoft Edge') {
      return;
    }

    this._bindFocusEvents();
  }

  disconnectedCallback() {
    this._unbindFocusEvents();
    super.disconnectedCallback && super.disconnectedCallback();
  }

  /**
   * Bind focus events.
   * @protected
   */
  _bindFocusEvents() {
    this.addEventListener('focus', this._setFocusWithin);
    this.addEventListener('focusin', this._setFocusWithin);

    this.addEventListener('focusout', this._removeFocusWithin);
    this.addEventListener('blur', this._removeFocusWithin);
  }

  /**
   * Unbind focus events.
   * @protected
   */
  _unbindFocusEvents() {
    this.removeEventListener('focus', this._setFocusWithin);
    this.removeEventListener('focusin', this._setFocusWithin);

    this.removeEventListener('blur', this._removeFocusWithin);
    this.removeEventListener('focusout', this._removeFocusWithin);
  }

  /**
   * Set `_focus` as a `true`.
   * Set `_focusWithin` as a `true`.
   * @protected
   */
  _setFocusWithin() {
    this._focus = true;
    this._focusWithin = true;
  }

  /**
   * Set `_focus` as a `false`.
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _removeFocusWithin() {
    this._focus = false;
    this._focusWithin = false;
  }
}