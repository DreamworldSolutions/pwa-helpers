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
          this._removeFocus();
        }
      }, 300);
    }
    this.__currentFocusedElement = val;

    this.__unbindRemoveFocusEventCurrenEl(oldValue);
    this.__bindRemoveFocusEventCurrenEl(val);
  }

  get _currentFocusedElement() {
    return this.__currentFocusedElement;
  }

  __bindRemoveFocusEventCurrenEl(el) {
    if(el) {
      el.addEventListener('blur', this._removeFocus);
      el.addEventListener('focusout', this._removeFocusWithin);
    }
  }

  __unbindRemoveFocusEventCurrenEl(el) {
    if(el) {
      el.removeEventListener('blur', this._removeFocus);
      el.removeEventListener('focusout', this._removeFocusWithin);
    }
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
  }

  disconnectedCallback() {
    this._unbindFocusEvents();
    super.disconnectedCallback && super.disconnectedCallback();
    this.__unbindRemoveFocusEventCurrenEl(this._currentFocusedElement);
    this._currentFocusedElement = undefined;
    //Remove focus on disconnect.
    this._removeFocus();
    thia._removeFocusWithin();
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
  _setFocus(e) {
    console.log("focus", this._viewId);
    if (this._blurTimeoutId) {
      clearTimeout(this._blurTimeoutId);
    }
    this._focus = true;
    this._currentFocusedElement = e && e.composedPath() && e.composedPath()[0];
  }

  /**
   * Set `_focus` as a `false`.
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _removeFocus() {
    console.log("blur", this._viewId);
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
  _setFocusWithin(e) {
    console.log("focus-in", this._viewId);
    if (this._focusoutTimeoutId) {
      clearTimeout(this._focusoutTimeoutId);
    }
    this._focusWithin = true;
    this._currentFocusedElement = e && e.composedPath() && e.composedPath()[0];
  }

  /**
   * Set `_focusWithin` as a `false`.
   * @protected
   */
  _removeFocusWithin() {
    console.log("focus-out", this._viewId);
    if (this.blurAfterTimeout) {
      this._focusoutTimeoutId = setTimeout(() => {
        this._focusWithin = false;
        this._focusoutTimeoutId = null;
      }, 250);
    } else {
      this._focusWithin = false;
    }
    this._currentFocusedElement = undefined;
  }
}