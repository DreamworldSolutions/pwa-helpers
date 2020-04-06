import Bowser from "bowser";

export const focusWithin = (baseElement) => class extends baseElement {
  constructor() {
    super();
    this._setFocus = this._setFocus.bind(this);
    this._setFocusWithin = this._setFocusWithin.bind(this);
    this._removeFocus = this._removeFocus.bind(this);
    this._removeFocusWithin = this._removeFocusWithin.bind(this);
  }

  static get properties() {
    return {
      /**
       * Element is focused or not, at present.
       */
      _focus: { type: Boolean, reflect: true, attribute: 'focus' },

      /**
       * Any child element has focus or not.
       */
      _focusWithin: { type: Boolean, reflect: true, attribute: 'focus-within' },

      /**
       * When it's `true`, trigger blur/focusout handler after timeout.
       */
      blurAfterTimeout: { type: Boolean }
    };
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    let bowser = Bowser.parse(window.navigator.userAgent);
    let __browserName = bowser.browser.name;
    let __browserVersion = bowser.version;
    const __osName = bowser.os.name;
    
    if ((__osName && __osName === 'iOS') || __browserName == 'Internet Explorer' ||  (__browserName == 'Microsoft Edge' && window.parseInt(__browserVersion) <= 18)) {
      this._bindFocusEvents();
    }
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
    this.addEventListener('focus', this._setFocus);
    this.addEventListener('focusin', this._setFocusWithin);
    this.addEventListener('blur', this._removeFocus);
    this.addEventListener('focusout', this._removeFocusWithin);
    
  }

  /**
   * Unbind focus events.
   * @protected
   */
  _unbindFocusEvents() {
    this.removeEventListener('focus', this._setFocus);
    this.removeEventListener('focusin', this._setFocusWithin);

    this.removeEventListener('blur', this._removeFocus);
    this.removeEventListener('focusout', this._removeFocusWithin);
  }


  /**
   * Set `_focus` as a `true`.
   * Set `_focusWithin` as a `true`.
   * @protected
   */
  _setFocus() {
    console.log('focus-within: _setFocus triggered');
    this._focus = true;
    this._setFocusWithin();
  }

  /**
   * Set `_focus` as a `false`.
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _removeFocus() {
    
    if (this.blurAfterTimeout) {
      setTimeout(() => {
        this._focus = false;
        console.log('focus-within: _removeFocus triggered after timeout.');
      }, 250);
    } else {
      this._focus = false;
      console.log('focus-within: _removeFocus triggered');
    }
    this._removeFocusWithin();
  }

  /**
   * Set `_focusWithin` as a `true`.
   * @protected
   */
  _setFocusWithin() {
    if (this.blurAfterTimeout) {
      setTimeout(() => {
        this._focusWithin = false;
        console.log('focus-within: _setFocusWithin triggered after timeout');
      }, 250);
    } else {
      this._focusWithin = false;
      console.log('focus-within: _setFocusWithin triggered');
    }
  }

  /**
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _removeFocusWithin() {
    console.log('focus-within: _removeFocusWithin triggered');
    this._focusWithin = false;
  }
}