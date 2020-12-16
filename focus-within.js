import Bowser from "bowser";

export const focusWithin = (baseElement) => class extends baseElement {
  constructor() {
    super();
    this._onFocus = this._onFocus.bind(this);
    this._onFocusIn = this._onFocusIn.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onFocusOut = this._onFocusOut.bind(this);
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

  /**
   * When current focused element is detached, removes focus.
   */
  set _currentFocusedElement(val) {
    const oldValue = this.__currentFocusedElement;
    if(val === oldValue) {
      return;
    }
    this._detachObserverIntervalHandle && clearInterval(this._detachObserverIntervalHandle);
    
    if (val) {
      this._detachObserverIntervalHandle = window.setInterval(() => {
        if (!val.isConnected) {
          this._onBlur();
        }
      }, 300);
    }
    this.__currentFocusedElement = val;
  }

  get _currentFocusedElement() {
    return this.__currentFocusedElement;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    let bowser = Bowser.parse(window.navigator.userAgent);
    let __browserName = bowser.browser.name;
    let __browserVersion = bowser.version;
    const __osName = bowser.os.name;
    if ((__osName && __osName === 'iOS') 
        || (__osName === 'macOS' && __browserName === 'Safari')
        || __browserName == 'Internet Explorer' 
        || (__browserName == 'Microsoft Edge' && window.parseInt(__browserVersion) <= 18)) {
      this._bindFocusEvents();
    }
    console.log("focus-within ==> connectedCallback ==> ", this._viewId);
  }

  disconnectedCallback() {
    this._unbindFocusEvents();
    super.disconnectedCallback && super.disconnectedCallback();
    this._currentFocusedElement = null;
    console.log("focus-within ==> disconnectedCallback ==> ", this._viewId);
  }

  /**
   * Bind focus events.
   * @protected
   */
  _bindFocusEvents() {
    this.addEventListener('focus', this._onFocus);
    this.addEventListener('focusin', this._onFocusIn);
    this.addEventListener('blur', this._onBlur);
    this.addEventListener('focusout', this._onFocusOut);
  }

  /**
   * Unbind focus events.
   * @protected
   */
  _unbindFocusEvents() {
    this.removeEventListener('focus', this._onFocus);
    this.removeEventListener('focusin', this._onFocusIn);

    this.removeEventListener('blur', this._onBlur);
    this.removeEventListener('focusout', this._onFocusOut);
  }


  /**
   * Set `_focus` as a `true`.
   * Set `_focusWithin` as a `true`.
   * @protected
   */
  _onFocus() {
    console.log("focus-within ==> _onFocus ==> ", this._viewId);
    if (this._blurTimeoutId) {
      clearTimeout(this._blurTimeoutId);
    }
    this._focus = true;
    this._focusWithin = false;
  }

  /**
   * Set `_focus` as a `false`.
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _onBlur() {
    console.log("focus-within ==> _onBlur ==> ", this._viewId);
    if (this.blurAfterTimeout) {
      this._blurTimeoutId = setTimeout(() => {
        this._focus = false;
        this._blurTimeoutId = null;
      }, 250);
    } else {
      this._focus = false;
    }
  }

  /**
   * Sets `_focusWithin` as a `true`.
   * Sets `_currentFocusedElement`
   * @protected
   */
  _onFocusIn(e) {
    console.log("focus-within ==> _onFocusIn ==> ", this._viewId);
    if (this._focusoutTimeoutId) {
      clearTimeout(this._focusoutTimeoutId);
    }
    this._focusWithin = true;
    this._focus = false;
    this._currentFocusedElement = e && e.composedPath() && e.composedPath()[0];
  }

  /**
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _onFocusOut() {
    console.log("focus-within ==> _onFocusOut ==> ", this._viewId);
    if (this.blurAfterTimeout) {
      this._focusoutTimeoutId = setTimeout(() => {
        this._focusWithin = false;
        this._focusoutTimeoutId = null;
      }, 250);
    } else {
      this._focusWithin = false;
    }
    this._currentFocusedElement = null;
  }
}