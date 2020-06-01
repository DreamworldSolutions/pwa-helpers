import Bowser from "bowser";

export const focusWithin = (baseElement) => class extends baseElement {
  constructor() {
    super();
    this._setFocus = this._setFocus.bind(this);
    this._setFocusWithin = this._setFocusWithin.bind(this);
    this._removeFocus = this._removeFocus.bind(this);
    this._removeFocusWithin = this._removeFocusWithin.bind(this);
    this._blurTimeoutId = null;
    this._focusoutTimeoutId = null;
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
       * When `true`  the work done on blur/focusout handler is to be delayed by 
       * 250 ms. 
       * 
       * This feature is created initially to solve an issue with iOS 13.4. 
       * Exact issue was as follows:
       * - There is an mwc-button in the shadow root of the element.
       * - That button becomes visible only when the element is focused.
       * - Due to this issue, click of the button doesn't work. Because, when 
       * user clicks on the button, focus is lost (navigated to the 'body')
       * and as a result button becomes hidden (or DOM is destroyed) before the
       * tap/click event was completed. 
       * 
       * This issue can be solved if the focus related attribute is removed 
       * after some delay.
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
    console.log('OS : ', __osName);
    console.log('BROWSER : ', __browserName);
    if ((__osName && __osName === 'iOS') 
        || (__osName === 'macos' && __browserName === 'safari')
        || __browserName == 'Internet Explorer' 
        || (__browserName == 'Microsoft Edge' && window.parseInt(__browserVersion) <= 18)) {
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
    if (this._blurTimeoutId) {
      clearTimeout(this._blurTimeoutId);
    }
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
      this._blurTimeoutId = setTimeout(() => {
        this._focus = false;
        this._blurTimeoutId = null;
      }, 250);
    } else {
      this._focus = false;
    }
    this._removeFocusWithin();
  }

  /**
   * Set `_focusWithin` as a `true`.
   * @protected
   */
  _setFocusWithin() {
    if (this._focusoutTimeoutId) {
      clearTimeout(this._focusoutTimeoutId);
    }
    this._focusWithin = true;
  }

  /**
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _removeFocusWithin() {
    if (this.blurAfterTimeout) {
      this._focusoutTimeoutId = setTimeout(() => {
        this._focusWithin = false;
        this._focusoutTimeoutId = null;
      }, 250);
    } else {
      this._focusWithin = false;
    }

  }
}