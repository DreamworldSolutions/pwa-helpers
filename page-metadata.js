import { isEqual, isEmpty } from 'lodash-es';

const setMetaTag = (attrName, attrValue, content) => {
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
};

const updateMetadata = ({ title, description, url, image, imageAlt }) => {
  if (title) {
    document.title = title;
    setMetaTag('property', 'og:title', title);
  }
  if (description) {
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:description', description);
  }
  if (image) {
    setMetaTag('property', 'og:image', image);
  }
  if (imageAlt) {
    setMetaTag('property', 'og:image:alt', imageAlt);
  }
  url = url || window.location.href;
  setMetaTag('property', 'og:url', url);
};

export const pageMetadata = baseElement =>
  class extends baseElement {
    constructor() {
      super();

      /**
       * Previous page metadata value hold this.
       * It's mainly used to compare previous and new value page metadata value is not equal then only update page metadata.
       */
      this.__pageMetaData = undefined;
    }

    static get properties() {
      return {
        active: { type: Boolean, reflect: true },
      };
    }

    updated(changedProps) {
      super.updated && super.updated(changedProps);

      //when page is in-active then previous page metadata value is also reset.
      if (this.active === false) {
        this.__pageMetaData = undefined;
      }

      //When page is active then request to update page metadata.
      if (this.active) {
        this.__requestUpdatePageMetaData();
      }
    }

    /**
     * Must have to override `_getPageMetadata` to return your page metadata.
     * @protected
     * @override
     */
    _getPageMetadata() {
      return undefined;
    }

    /**
     * When new page metadata is not empty and previous and new metadata is not equal then
     *  - Update page metadata using `updateMetadata` method of pwa-healpers.
     * @private
     */
    __requestUpdatePageMetaData() {
      let pageMetaData = this._getPageMetadata();

      if (!isEmpty(pageMetaData) && !isEqual(this.__pageMetaData, pageMetaData)) {
        this.__pageMetaData = pageMetaData;
        updateMetadata(pageMetaData);
      }
    }
  };

export default pageMetadata;
