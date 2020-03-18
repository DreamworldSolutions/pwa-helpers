
/**
  This is a JavaScript mixin that you can use to connect a Custom Element base
  class to a Redux store. The `stateChanged(state)` method will be called when
  the state is updated.

  Example:

      import { connect } from '@dreamworld/pwa-helpers/connect-mixin.js';

      class MyElement extends connect(store)(HTMLElement) {
        stateChanged(state) {
          this.textContent = state.data.count.toString();
        }
      }
*/
export const connect = (store) => (baseElement) => class extends baseElement {
  connectedCallback() {
      if (super.connectedCallback) {
          super.connectedCallback();
      }
      this._storeUnsubscribe = store.subscribe(() => this.__stateChanged(store.getState()));
      this.__stateChanged(store.getState());
  }
  disconnectedCallback() {
      this._storeUnsubscribe();
      if (super.disconnectedCallback) {
          super.disconnectedCallback();
      }
  }

  /**
   * Log console error of `stateChanged`.
   */
  __stateChanged(state) {
    try {
      this.stateChanged(state);
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