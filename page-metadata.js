import { updateMetadata } from 'pwa-helpers/metadata.js';
import isEqual from 'lodash-es/isEqual';
import isEmpty from 'lodash-es/isEmpty';

export const pageMetadata = (baseElement) => class extends baseElement {
  constructor() {
    super();

    /**
     * Previous page metadata value hold this.
     * It's mainly used to compare previous and new value page metadata value is not equal then only update page metadata.
     */
    this.__pageMetaData = undefined;
  }

  updated(changedProps) {
    super.updated && super.updated(changedProps);

    //when page is in-active then previous page metadata value is also reset.
    if(changedProps.has('active') && this.active === false) {
      this.__pageMetaData = undefined;
    }

    //When page is active then request to update page metadata.
    if(this.active) {
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

    if(!isEmpty(pageMetaData) && !isEqual(this.__pageMetaData, pageMetaData)) {
      this.__pageMetaData = pageMetaData;
      updateMetadata(pageMetaData);
    }
  }

}

export default pageMetadata;