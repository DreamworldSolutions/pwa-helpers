
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray.js';
import findIndex from 'lodash-es/findIndex.js';

/**
 * Overview
 *  - The Class provides an util methods for redux state update.
 * Use cases
 *  - import { ReduxUtils } from "@dw/pwa-helpers/redux-utils";
 */
export class ReduxUtils {
    
  /**
   * @param {Object} state - Redux current state object.
   * @param {String} path - Path on which value is updated.
   * @param {*} value - Value which you want to set on given path.
   * @param {String} - Path spliter. Default is '.'.
   * @return {Object} - New redux state object
   */
  static replace(state, path, value, spliter) {
    //create shallow copy of current db or new object.
    let oState = (state) ? {...state} : {};
    spliter = spliter || '.';
    //Remove postfix from path
    if(path.indexOf(spliter) === 0 ) {
      path = path.replace(spliter, '')
    }
    
    //if its leaf path
    if(path.indexOf(spliter) === -1) {
      //If value is undefined then delete that path otherwise set value
      if (value === undefined) {
        delete oState[path];
      } else {
        oState[path] = value;
      }
    } else {
      //Split path into firstPathSegment, remainingPath and do recursive call for next path
      let aPath = path.split(spliter);
      let firstPathSegment = aPath.shift(0);
      let remainingPath = aPath.join(spliter);
      oState[firstPathSegment] = ReduxUtils.replace(state[firstPathSegment] || {}, remainingPath, value, spliter);
    }
    
    //New state of redux
    return oState;
  }

  /**
   * @param {Object} store - Redux store.
   * @param {String|Array} path - Path(which is joined by '.'). Set of paths
   * @param {subscribeCallback} callback - Called when given `path` value is not undefined and value is changed.
   * - When `path` is string then callback invokes with new value
   * - When `path` is an Array then callback invokes with Array of object. e.g. [{path: path1, value: value1}, {path: path2, value: value2}]
   * @return {Function} - Unsubscribe handler. Integrate invokes this method to unsubscribe live state updates.
   */
  static subscribe(store, path, callback) {

    //For single path subscribe
    if(typeof path == 'string') {
      let currentValue = get(store.getState(), path);
      
      if(currentValue !== undefined) {
        Promise.resolve().then(() => {
          callback(currentValue);
        });
      }
  
      return store.subscribe(function () {
        let newValue = get(store.getState(), path);
        if (newValue !== currentValue) {
          currentValue = newValue;
          callback(newValue);
        }
      });
    }

    //For multi path subscribe
    let pathData = {};
    let dataList = [];

    path.forEach(function(sPath) {
      let currentValue = get(store.getState(), sPath);
      if(currentValue !== undefined) {
        pathData[sPath] = currentValue;
        dataList.push({
          path: sPath,
          value: currentValue
        });
      }
    });

    if(dataList.length) {
      Promise.resolve().then(() => {
        callback(dataList);
      });
    }

    return store.subscribe(function () {
      let updatedDataList = [];
      let oState = store.getState();
      path.forEach(function(sPath) {
        let newValue = get(oState, sPath);
        let prevValue = pathData[sPath] && pathData[sPath].value;
        if(prevValue !== newValue) {
          pathData[sPath] = {path: sPath, value: newValue};
          updatedDataList.push({path: sPath, value: newValue});
        }
      });
      
      if(updatedDataList.length) {
        callback(updatedDataList);
      }
    });
  }

  /**
   * if value is already exist for given path then immediately resolve promise.
   * otherwise first time value is changed then resolve promise.
   * @param {Object} store - Redux store.
   * @param {String} path - Path(which is joined by '.').
   * @return {Function} - Unsubscribe handler.
   */
  static async _onValue(store, path) {
    let resolve;
    
    let promise = new Promise((res, rej)=>{
      resolve = res;
    });

    let unsubscribe = this.subscribe(store, path, (value) => {
      unsubscribe();
      resolve(value);
    });
    
    return promise;
  }


  /**
   * if value already exists for given path(s) then resolves promise immediately.
   * otherwise when first time value is changed then promise is resolved.
   * @param {Object} store - Redux store.
   * @param {String|Array} paths - Single path as String & multiple paths are Array. Path is joined by '.'. e.g. abc.def
   * @return {Function} - Unsubscribe handler.
   */
  static async onValue(store, paths) {
    if(typeof paths == 'string') {
      return this._onValue(store, paths);
    }

    let valuesMap = {};
    await Promise.all(paths.map(async (path)=>{
      let value = await this._onValue(store, path);
      valuesMap[path] = value;
    }));
    return Promise.resolve(valuesMap);
  }
  
  /**
   * remove an item in the Array at the given `path` from specific index.
   * 
   * @param {*} state 
   * @param {*} path 
   * @param {*} index 
   */
  static removeItem(state, path, index){
    let aItems = get(state, path);
    if (aItems && !isArray(aItems)) {
      throw new Error('Value at "' + path + '" is not an Array');
    }

    aItems = [...aItems];
    aItems.splice(index, 1);
    return ReduxUtils.replace(state, path, aItems);
  }
  
  /**
   * Adds `items` to the Array at the given `path`. If no value exists at the given `path`, then new Array is
   * created with `items` in it.
   * 
   * @param {*} state 
   * @param {*} path 
   * @param {*} items - A Single Item OR Array of items, to be added to Array.
   */
  static addItems(state, path, items){
    let aItems = get(state, path);
    if (aItems && !isArray(aItems)) {
      throw new Error('Value at "' + path + '" is not an Array');
    }

    items = isArray(items) ? items : [items];
    let aNewItems = isArray(aItems) ?  [...aItems]: [];
    aNewItems.push.apply(aNewItems, items);
    return ReduxUtils.replace(state, path, aNewItems);
  }

  /**
   * Replaces an item in the Array at the given `path` with the `newItem`. Item comparision is done using `predicate` 
   * function/object accepted by Lodash.find(). Alternatively, you can directly send the index of the item in the Array.
   * 
   * No op if no matching item is found.
   * @param {*} state 
   * @param {*} path 
   * @param {Predicate|Number} predicate 
   * @param {*} newItem 
   */
  static replaceItem(state, path, predicateOrIndex, newItem) {
    let aItems = get(state, path);

    let index = Number.isInteger(predicateOrIndex) ? predicateOrIndex : findIndex(aItems, predicate);
    if(index < 0) {
      return;
    }
    aItems = [...aItems];
    aItems.splice(index, 1, newItem);
    return ReduxUtils.replace(state, path, aItems);
  }
  
}
