import { find, filter, isEqual, isEmpty, get } from 'lodash-es';
import { ReduxUtils } from './redux-utils.js';

/**
 * Persist a redux store in LocalStorage.
 * Note: Circular JSON structure is not supported
 * @class
 */
class ReduxPersistEnhancer {
  /**
   * @param {Array} persistOptions
   * @param {Function} filterFn - Used to filter some keys of local storage before it store into the redux store
   * @param {String|Object} path - Persists the value at path of object, i.e 'a.b.c'
   * @param {String} [path.path] - Persists the value at path of object, i.e 'a.b.c'
   * @param {Boolean} [path.shareBetweenTabs] - Share and apply changes immediately in other browser tabs on write
   *        Default value is false
   */
  constructor(persistOptions, filterFn) {
    /**
     * Configure options
     * @type Object
     */
    this._persistOptions = persistOptions;

    /**
     * Redux store
     * @type Object
     */
    this._store = undefined;

    /**
     * Holds orginal reducer function, as we are going to override it.
     * @type Function
     */
    this._originalReducer = undefined;

    /**
     * Holds orginal store.replaceReducer function, as we are going to override it.
     * @type Function
     */
    this._originalReplaceReducer = undefined;

    /**
     * Redux action type, This action will be dispatched when `shareBetwwenTabs=true` and value is changed in another tabs
     * @type String
     */
    this._rehydrateActionName = '@@APPLY_PERSIST_CHANGES';

    /**
     * Holds storage instance.
     * @type Object
     */
    this._storage = window.localStorage;

    /**
     * Holds event name, The event fires when a storage area has been modified in the context of another document.
     * @type String
     */
    this._storageEventName = 'storage';

    /**
     * Prefix for storage key. key example `__Redux_persist_.a.b.c`
     * @type String
     */
    this._storageKeyPrefix = '__Redux_persist_.';

    /**
     * `_hasShareBetweenTabsPath` is true when one or more path has configured with `shareBetweenTabs=true` flag
     * @type Boolean
     */
    this._hasShareBetweenTabsPath = false;

    /**
     * Used to filter local storage data before it store into redux store
     * @type Function
     */
    this._filterFn = filterFn;

    //Compute & set this._hasShareBetweenTabsPath
    if (find(this._persistOptions, { sharedBetweenTabs: true })) {
      this._hasShareBetweenTabsPath = true;
    }

    this.enhancer = this.enhancer.bind(this);
    this._replaceReducer = this._replaceReducer.bind(this);
  }

  /**
   * Returns persist store enhancer
   * @param {Function} nextCreator - Next store enhancer of compose function
   * @public
   * @returns {Function} storeEnhancer
   */
  enhancer(nextCreator) {
    return (reducer, preloadedState) => {
      return this._storeCreator(nextCreator, reducer, preloadedState);
    };
  }

  /**
   * Registers event listeners
   */
  _initialize() {
    window.addEventListener('unload', this._onWindowUnload.bind(this));
    if (this._hasShareBetweenTabsPath) {
      window.addEventListener(this._storageEventName, this._onStorageChanged.bind(this));

      //Registers store changes for `shareBetweenTabs` paths using ReduxUtils.subscribe
      let aSharedBetweenTabsPaths = [];
      this._persistOptions.forEach(data => {
        if (typeof data == 'object' && data.sharedBetweenTabs) {
          aSharedBetweenTabsPaths.push(data.path);
        }
      });
      ReduxUtils.subscribe(this._store, aSharedBetweenTabsPaths, this._onStateChanged.bind(this));
    }
  }

  /**
   * Invoked when the document being unloaded.
   */
  _onWindowUnload() {
    let dataList = [];
    //get current values for all paths of this._persistOptions and set dataList
    let oState = this._store.getState();

    this._persistOptions.forEach(function (data) {
      let path = typeof data == 'string' ? data : data.path;
      dataList.push({ path: path, value: get(oState, path) });
    });

    this._persist(dataList);
  }

  /**
   * Invoked when fires when a storage area (localStorage) has been modified in the context of another document.
   * @param {Object} e - Event object
   * @param {String} [e.key] - Represents the key changed. The key attribute is null when the change is caused by the storage clear() method
   * @param {String} [e.newValue] - The new value of the key. The newValue is null when the change has been invoked by storage clear() method or the key has been removed from the storage.
   * @param {String} [e.oldValue] - The original value of the key. The oldValue is null when the key has been newly added and therefore doesn't have any previous value.
   */
  _onStorageChanged(e) {
    let dataList = [];
    //Whe all local storage data is clared using storage clear method or using conslose UI option.
    if (e.key === null) {
      this._persistOptions.forEach(data => {
        if (typeof data == 'object' && data.sharedBetweenTabs) {
          dataList.push({ path: data.path, value: null });
        }
      });
      if (!isEmpty(dataList)) {
        this._rehydrate(dataList);
      }
      return;
    }

    //When local storage value is changed for any key. Ignore if changed key is not match with any configured path
    if (e.key) {
      let path = e.key.replace(this._storageKeyPrefix, '');
      this._persistOptions.forEach(data => {
        let storePath = typeof data == 'string' ? data : data.path;
        if (path === storePath) {
          dataList.push({ path: path, value: this._getLocalStoragevalue(path) || null });
          return;
        }
      });
    }

    if (!isEmpty(dataList)) {
      this._rehydrate(dataList);
    }
  }

  /**
   * Invoked when state is changed for `shareBetweenTabs` paths
   * @param {Array} changes
   * @param {String} changes.path - Changed path
   * @param {String} changes.value - New value of changed path
   */
  _onStateChanged(changes) {
    this._persist(changes);
  }

  /**
   * Byvalue Compare new data with stored data and update stored if it's not equal
   * @param {Array} dataList
   * @param {String} dataList.path - Changed path
   * @param {String} dataList.value - New value of changed path
   */
  _persist(dataList) {
    if (!dataList) {
      return;
    }

    //Byvalue Compare new data with stored data and update stored if it's not equal
    dataList.forEach(data => {
      if (data.value === undefined) {
        this._storage.removeItem(this._storageKeyPrefix + data.path);
      } else if (!isEqual(data.value, this._getLocalStoragevalue(data.path))) {
        this._storage.setItem(this._storageKeyPrefix + data.path, JSON.stringify(data.value));
      }
    });
  }

  /**
   *
   * @param {*} path - Local storage path without prefix
   * @return - Local storage value
   */
  _getLocalStoragevalue(path) {
    let data = this._storage.getItem(this._storageKeyPrefix + path);
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }

  /**
   * Byvalue Compare new data with stored data and rehydrate if it's not equal
   * @param {Array} dataList
   * @param {String} dataList.path - Changed path
   * @param {String} dataList.value - New value of changed path
   */
  _rehydrate(dataList) {
    let oState = this._store.getState();

    //Byvalue Compare new data with stored data and rehydrate stored if it's not equal
    let aUpdatedData = filter(dataList, function (data) {
      return !isEqual(data.value, get(oState, data.path));
    });

    if (aUpdatedData.length) {
      //Dispatching @@APPLY_PERSIST_CHANGES event on store
      this._store.dispatch({
        type: this._rehydrateActionName,
        changes: aUpdatedData,
      });
    }
  }

  /**
   * Reads value from storage and override it in preloadedState without mutations
   * @param {Object} [preloadedState]
   * @returns {Object}
   */
  _overridePreloadState(preloadedState) {
    //Read from staoge and override preloadedState Using reduxUtils.replace
    if (!preloadedState) {
      preloadedState = {};
    }

    let storageData = undefined;
    this._persistOptions.forEach(data => {
      let path = typeof data === 'string' ? data : data.path;
      storageData = this._getLocalStoragevalue(path);
      if (storageData != undefined) {
        preloadedState = ReduxUtils.replace(preloadedState, path, storageData, '.');
      }
    });

    return preloadedState;
  }

  /**
   * A reducer to apply state changes which made in another browser tabs
   * @param {Object} [state] - Current redux state
   * @param {Object} [action] - Redux action object
   * @param {Object} action.type - Action name, This reducer handles `type=@@APPLY_PERSIST_CHANGES`
   * @param {Object} action.changes - Holds new values for path. key=path, value= newValue
   * @param {*} action.changes[path]
   * @return {Object} newState
   */
  _rehydrateReducer(state, action) {
    if (action && action.type === this._rehydrateActionName) {
      //apply changes
      let oState = state;
      action.changes.forEach(function (data) {
        oState = ReduxUtils.replace(oState, data.path, data.value, '.');
      });
      return oState;
    }
    return state;
  }

  /**
   * Overrides original reducer, and returns wrapper
   * @param {Function} reducer - Original reducer
   * @return {Function} wrappedRedcuer
   */
  _wraprReducer(reducer) {
    this._originalReducer = reducer;

    return (state, action) => {
      if (action && action.type === this._rehydrateActionName) {
        return this._rehydrateReducer(state, action);
      }
      return this._originalReducer.call(this._store, state, action);
    };
  }

  /**
   * Overriden store.replaceReudcer method
   * @param {Function} reducer - Original reducer
   * @return {Function} Overriden store.replaceReudcer
   */
  _replaceReducer(reducer) {
    return this._originalReplaceReducer.call(this._store, this._wraprReducer(reducer));
  }

  /**
   * Overrides reducer, preloadedState and store.replaceReducer and returns nextStore
   * @param {Function} nextCreator - Next store enhancer of compose function
   * @param {Function} reducer A reducing function that returns the next state tree,
   * @param {Object} preloadedState The initial state.
   * @returns {Object} nextStore
   */
  _storeCreator(nextCreator, reducer, preloadedState) {
    preloadedState = this._overridePreloadState(preloadedState);

    if (this._filterFn) {
      preloadedState = this._filterFn(preloadedState) || {};
    }

    this._store = nextCreator(this._wraprReducer(reducer), preloadedState);
    this._originalReplaceReducer = this._store.replaceReducer;
    this._initialize();

    return {
      ...this._store,
      replaceReducer: this._replaceReducer,
    };
  }
}

export const persistEnhancer = (persistOptions, filterFn) => {
  let reduxPersistEnhancer = new ReduxPersistEnhancer(persistOptions, filterFn);
  return reduxPersistEnhancer.enhancer;
};

export default persistEnhancer;
