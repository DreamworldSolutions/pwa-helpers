/**
  A Redux store enhancer that lets you lazy-install reducers after the store
  has booted up. Use this if your application lazy-loads routes that are connected
  to a Redux store.

  Example:

      import { combineReducers } from 'redux';
      import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';
      import someReducer from './reducers/someReducer.js';

      export const store = createStore(
        (state, action) => state,
        compose(lazyReducerEnhancer(combineReducers))
      );

  Then, in your page/element, you can lazy load a specific reducer with:

      store.addReducers({
        someReducer
      });
*/
export const lazyReducerEnhancer = (combineReducers) => {
  const enhancer = (nextCreator) => {
    return (origReducer, preloadedState) => {
      let lazyReducers = {};
      const nextStore = nextCreator(origReducer, preloadedState);
      return Object.assign({}, nextStore, {
        addReducers(newReducers) {
          const combinedReducerMap = Object.assign(
            {},
            lazyReducers,
            newReducers
          );
          this.replaceReducer(
            combineReducers((lazyReducers = combinedReducerMap))
          );
        },
      });
    };
  };
  return enhancer;
};

export default lazyReducerEnhancer;