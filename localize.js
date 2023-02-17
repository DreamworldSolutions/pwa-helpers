import { isServer } from "./lit.js";
import i18nextModule from "i18next";

export const localize = (i18next) => (BaseElement) =>
  class extends BaseElement {
    /**
     * Declared properties and their corresponding attributes
     */
    static get properties() {
      return {
        /**
         * Language ISO Code. e.g. `en` for English. `hi` for Hindi.
         * This property is mainly for the output property, it's set/changed as per the `i18next` configuration.
         * In most of the cases, this isn't need to be used by anyone. But, it's declared as property as re-render
         * is triggered automatically, when it's changed.
         */
        _language: {
          type: String,
        },

        /**
         * When it's `true`, do not delay rendering.
         */
        doNotDelayRendering: { type: Boolean },

        /**
         * Input property.
         * This property is available only for SSR.
         */
        request: { type: Object },
      };
    }

    constructor() {
      super();
      this._i18next = i18next || i18nextModule;
    }

    connectedCallback() {
      super.connectedCallback && super.connectedCallback();
      this.__initLocalize();
    }

    /**
     * @returns `true` when Parent Class returns `true` & language resources is loaded except `doNotDelayRendering` is set to `true`.
     * @param {Object} changedProps Changed properties
     */
    shouldUpdate(changedProps) {
      if (isServer) {
        return true;
      }

      return (
        super.shouldUpdate(changedProps) &&
        (this.doNotDelayRendering || this._language)
      );
    }

    async __initLocalize() {
      await this.__initI18n();
      await this.__loadI18nextNamespaces();
      this._setLanguage(this.i18next.language);
      this.i18next.on("languageChanged", () => {
        this._setLanguage(this.i18next.language);
      });
    }

    /**
     * A protected function which implement can override to do some custom work when language is changed. e.g. If
     * some properties are bound with imperative bindings then those can be re-computed from this function.
     *
     * Default implementation sets/updates `language` property, which triggered re-render of the element. So, don't
     * forget to invoke super function.
     *
     * @param {String} newLanguage
     */
    _setLanguage(newLanguage) {
      this._language = newLanguage;
    }

    __initI18n() {
      if (this.i18next.isInitialized) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        this.i18next.on("initialized", () => {
          resolve();
        });
      });
    }

    __loadI18nextNamespaces() {
      if (!this.i18nextNameSpaces || this.i18nextNameSpaces.length == 0) {
        return Promise.resolve();
      }
      return this.i18next.loadNamespaces(this.i18nextNameSpaces);
    }

    get language() {
      return (
        (this.request && this.request.i18n && this.request.i18n.language) ||
        this._language
      );
    }

    /**
     * When SSR, returns 18next instance provided by server request otherwise client-side i18next instance.
     */
    get i18next() {
      return (this.request && this.request.i18n) || this._i18next;
    }

    /**
     * @returns i18next.t() Reference: https://www.i18next.com/overview/api#t
     */
    t(keys, options) {
      return this.i18next.t(keys, options);
    }
  };

export default localize;
