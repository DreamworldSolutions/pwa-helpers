/**
  This is a JavaScript mixin that you can use to connect a Custom Element base
  class to a Redux store. The `stateChanged(state)` method will be called when
  the state is updated.

  The `stateChanged(state)` method will be called when `active` property set to `true` as well.

  Example:

      import { connect } from '@dreamworld/pwa-helpers/connect-mixin.js';

      class MyElement extends connect(store)(HTMLElement) {
        stateChanged(state) {
          this.textContent = state.data.count.toString();
        }
      }
*/
import debounce from 'lodash-es/debounce.js';

export const connect = (store) => (baseElement) => class extends baseElement {
  connectedCallback() {
    if (super.connectedCallback) {
        super.connectedCallback();
    }

    this.__stateChanged(store.getState());
    this.__stateChanged = debounce(this.__stateChanged, 50);
    this._storeUnsubscribe = store.subscribe(() => this.__stateChanged(store.getState()));
  }
  disconnectedCallback() {
      this._storeUnsubscribe && this._storeUnsubscribe();
      if (super.disconnectedCallback) {
          super.disconnectedCallback();
      }
  }

    /**
   * Setter of active property.
   */
  set active(val) {
    let oldValue = this._active;
    if(val === oldValue) {
      return;
    }

    this._active = val;
    this.requestUpdate('active', oldValue);
    this.isConnected && this.__stateChanged(store.getState());
  }

  /**
   * Getter of active property.
   */
  get active() {
    return this._active;
  }

  /**
   * Log console error of `stateChanged`.
   * Trigger `stateChanged` only when actual state is changed & active property is `true`
   * When `active` property is not defined it will not prevent `stateChanged` call unless state is not changed.
   */
  __stateChanged(state) {
    try {
      if (this.__previousState === state || (this.active === false)) {
        return;
      }
      
      this.stateChanged(state);
      this.__previousState = state;
    } catch (err) {
      console.error(err);
    }
  }
  /**
   * The `stateChanged(state)` method will be called when the state is updated.
   */
  stateChanged(_state) { }
};
//# sourceMappingURL=connect-mixin.js.map