/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement as PolymerLitElement } from 'lit-element';
import get from 'lodash-es/get.js';
import isEmpty from 'lodash-es/isEmpty.js';

let config = get(window, 'dw.pwaHelpers.LitElementConfig');

/**
 * List of elements which contains how many instance is created of element and how many times of element was updated
 *
 * Example:
 * { PWA-APP: {
 *    PWA-APP-1: {
 *      userDefinedViewId: '',
 *      count: 2
 *    }
 *  }
 * }
 *
 * e.g. {
 *  {ElementName}: {
 *    {ElementName}-N: {
 *      userDefinedViewId: '', //Exist if user has defined view id using `viewId` property
 *      count: N // How many times this component was updated
 *    }
 *  }
 * }
 */
let updatesCount = {};

/**
 * Represents how many instances of an element has been created so far.
 *
 * e.g: { 'PWA-APP': 1 }
 *
 */
let instancesCount = {};

/**
 * Custom LitElement which extends Polymer LitElement class
 * It provides way to see updated summary that how many component is created and how many times components is updated.
 */
class DwLitElement extends PolymerLitElement {

  connectedCallback() {
    super.connectedCallback();
    this.active = true;

    this._setViewId();

    if (config && config.debugRender) {
      this._initUpdatesCount();
    }

    //Validate mandatory properties after timeout because of if fragment is loaded using dynamic import then defined
    //defined property value will be available after zero timeout in connected callback
    window.setTimeout(() => {
      this._validateMandatoryProps();
    }, 0);
  }

  /**
    * Declared properties and their corresponding attributes
    */
  static get properties() {
    return {

      /**
       * Reperesent element is active or not.
       * It's mainly used element rendering or not.
       * The default value is true.
       * Property to set false then the element is at-least render one-time because it's children is also in-active.
       */
      active: { type: Boolean, reflect: true },

      /**
       * Input property.
       * When it's `true` enable scrollLock feature.
       */
      enableScrollLock: { type: Boolean },

      /**
       * Input property.
       * When it's true scroll lock applied to element.
       * When it's false then remove scroll lock and restore it to previous position.
       */
      scrollLock: { type: Boolean }
    };
  }

  _initUpdatesCount() {
    let nodeName = this.nodeName;
    //Set default value for connected component's updated event
    updatesCount = updatesCount ? updatesCount: {};
    instancesCount = instancesCount ? instancesCount: {};
    if (!updatesCount[nodeName]) {
      updatesCount[nodeName] = {};
    }

    if(!this._viewId) {
      this._setViewId();
    }

    updatesCount[nodeName][this._viewId] = { userDefinedViewId: this.viewId || '', updated: 0 };
    updatesCount[this.nodeName].count = instancesCount[this.nodeName];
  }

  _setViewId() {
    if(this._viewId) {
      return;
    }

    //Manage connected components instances count
    instancesCount = instancesCount ? instancesCount: {};
    let nodeName = this.nodeName;
    if (!instancesCount[nodeName]) {
      instancesCount[nodeName] = 1;
    } else {
      instancesCount[nodeName] = instancesCount[nodeName] + 1;
    }

    //Set view id on component
    this._viewId = nodeName + '-' + instancesCount[nodeName];
  }

  _getViewId() {
    return this.viewId ? this._viewId + '(' + this.viewId + ')' : this._viewId;
  }

  _validateMandatoryProps() {
    if (!this.mandatoryProps) {
      return;
    }

    let undefinedProps = [];
    this.mandatoryProps.forEach((prop) => {
      if (this[prop] === undefined) {
        undefinedProps.push(prop);
      }
    });

    if (!isEmpty(undefinedProps)) {
      console.error(this._getViewId() + ':: Mandatory properties not defined. props=', undefinedProps);
    }
  }

  _cleanupUpdatesCount() {
    if(!this._viewId) {
      return;
    }

    let nodeName = this.nodeName;
    updatesCount = updatesCount ? updatesCount: {};
    if (updatesCount && updatesCount[nodeName] && updatesCount[nodeName][this._viewId]) {
      delete updatesCount[nodeName][this._viewId];
    }
  }

  /**
   * Shows WARN log if the properties defined by `constProps` has been changed.
   * @param changedProps
   */
  _warnConstProps(changedProps) {
    //Validate constant properties
    if (this.constantProps && changedProps) {
      this.constantProps.forEach((prop) => {
        if (changedProps.has(prop) && changedProps.get(prop) !== undefined) {
          console.warn(this._getViewId() + ':: Constant property value is changed. prop=', prop, ' prevValue=',
            changedProps.get(prop), ' newValue=', this[prop]);
        }
      });
    }
  }

  _incrUpdatesCount() {
    if(!this._viewId) {
      this._setViewId();
    }

    updatesCount = updatesCount ? updatesCount: {};
    let elementUpdatedData = updatesCount[this.nodeName][this._viewId];
    let curCount = elementUpdatedData ? elementUpdatedData.updated : 0;
    updatesCount[this.nodeName][this._viewId] = { userDefinedViewId: this.viewId || '', updated: curCount + 1 };
  }

  /**
   * Adds a debug log for changed properties.
   */
  _logChangedProps(changedProps) {
    let oChangedProps = {};
    changedProps && changedProps.forEach((val, key, map) => {
      oChangedProps[key] = {
        newVal: this[key],
        oldVal: changedProps.get(key) || undefined
      }
    });

    let oUpdatedData = {
      changedProps: oChangedProps,
      userDefinedViewId: this.viewId
    }

    console.log(this._getViewId() + ' updated.', oUpdatedData);
  }

  disconnectedCallback() {
    if (config && config.debugRender) {
      this._cleanupUpdatesCount();
    }
    super.disconnectedCallback();
  }

  /**
   * Avoid extra rendering.
   *  - When elements is disconnected.
   *  - When elements is in-active
   * @override lit-element should update method(https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate)
   */
  shouldUpdate(changedProps) {
    //The current element is disconnected.
    if (!this.isConnected) {
      return false;
    }

    //The current element is in-active then at-least current element childrens are also in-active.
    if (changedProps.has('active') && changedProps.get('active') === true && this.active === false) {
      return true;
    }

    //Current element is active.
    return this.active;
  }

  updated(changedProps) {
    this._warnConstProps(changedProps);

    if (config && config.debugRender) {
      this._incrUpdatesCount();
    }

    if (config && config.debugPropChanges) {
      this._logChangedProps(changedProps);
    }

    if (this.enableScrollLock && (changedProps.has('active') || changedProps.has('scrollLock'))) {
      if (this.active === true && this.scrollLock === true) {
        this.__applyScrollLock();
      } else {
        this.__removeScrollLock();
      }
    }
  }

  __applyScrollLock() {
    this._lastScrollPos = document.scrollingElement.scrollTop;
    this._lastPosition = getComputedStyle(this).position;
    this.style.position = 'fixed';
    this.style.height = '100vh';
    this.style.overflow = 'hidden';
    this.scrollTop = this._lastScrollPos;
  }

  __removeScrollLock(){
    this.style.position = this._lastPosition;
    this.style.height = 'auto';
    this.style.overflow = 'unset';
    //This must be done after this element's style (position) is changed. 
    //Otherwise, scrollingElement won't have anything scrollable.
    document.scrollingElement.scrollTop = this._lastScrollPos;
  }

  /**
   * @return { Object } - Updated summary of components
   */
  static getUpdatedSummary() {
    updatesCount = updatesCount ? updatesCount: {};
    return { ...updatesCount };
  }

  /**
   * Clear updated summary
   */
  static clearUpdatedSummary() {
    updatesCount = updatesCount ? updatesCount: {};
    for (let eleName in updatesCount) {
      for (let eleId in updatesCount[eleName]) {
        let oInstanceUpdatedData = updatesCount[eleName];
        if (eleId === 'count') {
          oInstanceUpdatedData[eleId] = 0;
        } else {
          oInstanceUpdatedData[eleId].updated = 0;
        }
      }
    }
  }
}

if (!config || !config.disabled) {
  window.LitElement = DwLitElement;
}

export const LitElement = (config && config.disabled) ? PolymerLitElement : DwLitElement;