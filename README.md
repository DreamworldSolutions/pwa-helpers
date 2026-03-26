# @dreamworld/pwa-helpers

A collection of JavaScript mixins, enhancers, and utilities for building PWA applications with LitElement and Redux. Provides cross-browser focus management, Redux state persistence and lazy-loading, i18n integration via i18next, page metadata management, and an extended LitElement base class with debugging and lifecycle controls.

---

## 1. User Guide

### Installation & Setup

**Package name:** `@dreamworld/pwa-helpers`
**Module type:** ES Module (`"type": "module"` in `package.json`)

Install via npm or yarn:

```bash
npm install @dreamworld/pwa-helpers
# or
yarn add @dreamworld/pwa-helpers
```

**Peer dependencies required in your project:**

| Package | Version |
|---|---|
| `bowser` | `^2.11.0` |
| `i18next` | `^23.7.12` |
| `lit` | `^3.1.0` |
| `lit-element` | `^4.0.2` |
| `lodash-es` | `^4.17.21` |

**Optional global configuration** (set before module import):

```javascript
window.dw = {
  pwaHelpers: {
    LitElementConfig: {
      debugRender: false,      // Enable render count tracking
      debugPropChanges: false, // Enable changed-property logging
      disabled: false          // Fall back to raw LitElement
    }
  }
};
```

---

### Basic Usage

Each helper is a separate ES module. Import only what you need:

```javascript
// Focus helpers
import { focusWithin } from '@dreamworld/pwa-helpers/focus-within.js';
import { focusable }   from '@dreamworld/pwa-helpers/focusable.js';

// Redux helpers
import { connect }              from '@dreamworld/pwa-helpers/connect-mixin.js';
import { lazyReducerEnhancer }  from '@dreamworld/pwa-helpers/lazy-reducer-enhancer.js';
import { persistEnhancer }      from '@dreamworld/pwa-helpers/redux-persist-enhancer.js';
import { ReduxUtils }           from '@dreamworld/pwa-helpers/redux-utils.js';

// LitElement extensions
import { LitElement, html, css } from '@dreamworld/pwa-helpers/lit.js';        // lit v3
import { LitElement }            from '@dreamworld/pwa-helpers/lit-element.js'; // lit-element v4

// i18n
import localize from '@dreamworld/pwa-helpers/localize.js';

// Metadata
import { pageMetadata }                   from '@dreamworld/pwa-helpers/page-metadata.js';
import { updateMetadata, setMetaTag }     from '@dreamworld/pwa-helpers/metadata.js';

// Misc
import { layoutMixin }                    from '@dreamworld/pwa-helpers/layout-mixin.js';
import { buttonFocus }                    from '@dreamworld/pwa-helpers/button-focus.js';
import { isElementAlreadyRegistered }     from '@dreamworld/pwa-helpers/utils.js';
```

The top-level `index.js` re-exports a subset:

```javascript
export { focusWithin } from './focus-within.js';
export { buttonFocus } from './button-focus.js';
export { pageMetadata } from './page-metadata.js';
```

---

### Module Index

| Module | Export | Purpose |
|---|---|---|
| `connect-mixin.js` | `connect` | Mixin — connects a LitElement to a Redux store |
| `button-focus.js` | `buttonFocus` | Mixin — fixes `tabindex` on Safari/iOS Chrome for button-like elements |
| `focus-within.js` | `focusWithin` | Mixin — polyfills `:focus` / `:focus-within` attributes on iOS, IE, and old Edge |
| `focusable.js` | `focusable` | Mixin — makes an element focusable via `tabindex`; extends `focusWithin` |
| `focusable-item.js` | `FocusableItem` | Custom element (`<focusable-item>`) — a `<slot>` wrapper using `focusable` |
| `layout-mixin.js` | `layoutMixin` | Mixin — sets `mobile` property based on initial viewport width |
| `lit.js` | `LitElement`, all `lit` exports | Extended `lit` v3 LitElement with debug, render control, scroll lock; SSR-safe |
| `lit-element.js` | `LitElement` | Extended `lit-element` v4 LitElement with same features (not SSR-safe) |
| `localize.js` | `localize` (default) | Mixin — integrates i18next for multilingual LitElement components |
| `metadata.js` | `updateMetadata`, `setMetaTag` | Utilities — imperatively set Open Graph / Twitter card meta tags |
| `page-metadata.js` | `pageMetadata` (default) | Mixin — declaratively updates page metadata when a page becomes active |
| `lazy-reducer-enhancer.js` | `lazyReducerEnhancer` (default) | Redux enhancer — enables lazy-loaded reducers via `store.addReducers()` |
| `redux-persist-enhancer.js` | `persistEnhancer` (default) | Redux enhancer — persists state paths to `localStorage` with cross-tab sync |
| `redux-utils.js` | `ReduxUtils` | Class — immutable state manipulation and store subscription helpers |
| `utils.js` | `isElementAlreadyRegistered` | Utility — checks if a custom element is already registered |

---

### API Reference

---

#### `connect-mixin.js` — `connect(store)(BaseElement)`

Connects a custom element to a Redux store. `stateChanged(state)` is called whenever the store state changes, unless `active === false`.

**Usage:**

```javascript
import { connect } from '@dreamworld/pwa-helpers/connect-mixin.js';
import { store } from './store.js';

class MyElement extends connect(store)(LitElement) {
  stateChanged(state) {
    this.count = state.counter.value;
  }
}
```

**Properties:**

| Property | Type | Description |
|---|---|---|
| `active` | `Boolean` | When `false`, `stateChanged` is not called. Triggers `stateChanged` when set back to `true`. |
| `request` | `Object` | SSR input. If `request.store` is set, `stateChanged` is called with that store's state in `willUpdate`. |

**Methods to override:**

| Method | Signature | Description |
|---|---|---|
| `stateChanged` | `(state: Object) => void` | Called when store state changes and `active !== false`. Default implementation is a no-op. |

**Behavior notes:**
- Subscribes to the store in `connectedCallback`; unsubscribes in `disconnectedCallback`.
- Skips `stateChanged` if state reference is identical to the previous call (reference equality).
- Errors thrown inside `stateChanged` are caught and logged via `console.error`.

---

#### `button-focus.js` — `buttonFocus(BaseElement)`

Fixes `tabindex` management for Safari and iOS Chrome, where button-like custom elements do not receive focus without an explicit `tabindex` attribute.

**Usage:**

```javascript
import { buttonFocus } from '@dreamworld/pwa-helpers/button-focus.js';

class MyButton extends buttonFocus(LitElement) { }
```

**Properties:**

| Property | Type | Default | Reflected | Description |
|---|---|---|---|---|
| `disabled` | `Boolean` | — | Yes | When `true`, removes `tabindex` attribute on Safari/iOS Chrome. |
| `buttonFocusDisabled` | `Boolean` | — | No | When `true`, disables all `tabindex` management performed by this mixin. |
| `tabindex` | `Number` | `0` | No | Value applied as the `tabindex` attribute when the element is not disabled. |

**Protected methods:**

| Method | Description |
|---|---|
| `_updateTabIndex()` | Applies or removes `tabindex` only on Safari or iOS Chrome. |
| `_setTabindex()` | Sets `tabindex` attribute to the value of `this.tabindex`. |
| `_removeTabindex()` | Removes the `tabindex` attribute. |
| `_isDisabled()` | Returns `true` if `this.disabled` is truthy or the `disabled` attribute is present. |

---

#### `focus-within.js` — `focusWithin(BaseElement)`

Polyfills `:focus` and `:focus-within` CSS pseudo-classes by setting `focus` and `focus-within` boolean attributes on the host element. Only activates on iOS, macOS Safari, Internet Explorer, and Microsoft Edge ≤ 18.

**Usage:**

```javascript
import { focusWithin } from '@dreamworld/pwa-helpers/focus-within.js';

class MyInput extends focusWithin(LitElement) { }
```

**Properties:**

| Property | Type | Attribute | Reflected | Description |
|---|---|---|---|---|
| `_focus` | `Boolean` | `focus` | Yes | Present when the host element itself is focused. |
| `_focusWithin` | `Boolean` | `focus-within` | Yes | Present when any descendant has focus. |
| `blurAfterTimeout` | `Boolean` | — | No | When `true`, delays removal of focus attributes by 250 ms (fixes iOS 13.4 tap-on-conditionally-visible-button issue). |

**Protected methods:**

| Method | Description |
|---|---|
| `_bindFocusEvents()` | Attaches `focus`, `focusin`, `blur`, `focusout` event listeners. |
| `_unbindFocusEvents()` | Detaches the above listeners. |
| `_setFocus()` | Sets `_focus = true` and calls `_setFocusWithin()`. Cancels any pending blur timeout. |
| `_removeFocus()` | Sets `_focus = false` (optionally after 250 ms delay) and calls `_removeFocusWithin()`. |
| `_setFocusWithin(e)` | Sets `_focusWithin = true` and tracks `_currentFocusedElement` from `e.composedPath()[0]`. |
| `_removeFocusWithin()` | Sets `_focusWithin = false` (optionally after 250 ms delay) and clears `_currentFocusedElement`. |

**Internal behavior:**
- Monitors `_currentFocusedElement` with a 300 ms `setInterval`; calls `_removeFocus()` if the element is detached from the DOM.

---

#### `focusable.js` — `focusable(BaseElement)`

Extends `focusWithin` to make an element focusable. Adds a reflected `tabindex` property defaulting to `'0'`.

**Usage:**

```javascript
import { focusable } from '@dreamworld/pwa-helpers/focusable.js';

class MyCard extends focusable(LitElement) { }
```

**Properties (own):**

| Property | Type | Default | Reflected | Description |
|---|---|---|---|---|
| `tabindex` | `String` | `'0'` | Yes | Value of the `tabindex` attribute. Inherits all `focusWithin` properties. |

---

#### `focusable-item.js` — `<focusable-item>`

A pre-built custom element that combines `focusable` with a `<slot>`. Registered as `focusable-item`.

**Usage:**

```html
<focusable-item>
  <span>Any content</span>
</focusable-item>
```

**Styles:**

| Rule | Value |
|---|---|
| `:host { display }` | `block` |

Inherits all `focusable` and `focusWithin` properties.

---

#### `layout-mixin.js` — `layoutMixin(BaseElement)`

Sets a `mobile` boolean property at construction time based on `window.innerWidth < 768`. Does not add resize observers; the integrator is responsible for updating `mobile` after `connectedCallback`.

**Usage:**

```javascript
import { layoutMixin } from '@dreamworld/pwa-helpers/layout-mixin.js';

class MyLayout extends layoutMixin(LitElement) {
  // this.mobile is true when initial innerWidth < 768
}
```

**Properties:**

| Property | Type | Default | Reflected | Description |
|---|---|---|---|---|
| `mobile` | `Boolean` | `window.innerWidth < 768` | Yes | `true` when viewport width at construction is less than 768 px. Always `false` on SSR. |

---

#### `lit.js` — `LitElement` (lit v3 wrapper)

Re-exports everything from `lit` and replaces `LitElement` with `DwLitElement`, an extended subclass. SSR-safe (`globalThis` used instead of `window`).

**Usage:**

```javascript
import { LitElement, html, css } from '@dreamworld/pwa-helpers/lit.js';
```

**Additional properties (beyond `lit.LitElement`):**

| Property | Type | Default | Reflected | Description |
|---|---|---|---|---|
| `active` | `Boolean` | `undefined` | Yes | Controls rendering when `shouldNotUpdateWhenInactive` is `true`. |
| `shouldNotUpdateWhenInactive` | `Boolean` | `undefined` | No | Must be `true` to enable `active`-based render suppression. |
| `enableScrollLock` | `Boolean` | — | No | Opt-in to scroll lock feature. |
| `scrollLock` | `Boolean` | — | No | When `true` and `active === true` and `enableScrollLock === true`, applies scroll lock to the document. |

**Instance properties (not declared as reactive, set manually):**

| Property | Type | Description |
|---|---|---|
| `_viewId` | `String` | Auto-assigned ID, e.g. `MY-ELEMENT-1`, `MY-ELEMENT-2`. Set in `connectedCallback`. |
| `viewId` | `String` | Optional user-assigned label. Appears in logs as `MY-ELEMENT-1(myLabel)`. |
| `mandatoryProps` | `String[]` | Property names checked for `undefined` after `connectedCallback`. Logs `console.error` if missing. |
| `constantProps` | `String[]` | Property names that log `console.warn` if changed after first assignment. |

**Static methods:**

| Method | Signature | Description |
|---|---|---|
| `getUpdatedSummary` | `() => Object` | Returns a snapshot of render counts keyed by element name and view ID. Populated only when `debugRender=true`. |
| `clearUpdatedSummary` | `() => void` | Resets all render counts to `0`. Relevant only when `debugRender=true`. |

**`shouldUpdate` behavior (when `shouldNotUpdateWhenInactive` is `true`):**

| Condition | Renders? |
|---|---|
| Element is disconnected | No |
| `active` transitions from `true` → `false` | Yes (one final render to propagate `active=false` to children) |
| Any prop changes while `active === false` | No |
| `active === true` or `shouldNotUpdateWhenInactive` not set | Yes |

**Scroll lock behavior (when `enableScrollLock === true`):**

- Lock applied when `active === true && scrollLock === true`: sets `position: fixed`, `height: 100vh`, `overflow: hidden`, saves `document.scrollingElement.scrollTop`.
- Lock removed otherwise: restores `position`, `height: auto`, `overflow: unset`, and `document.scrollingElement.scrollTop`.

---

#### `lit-element.js` — `LitElement` (lit-element v4 wrapper)

Same API and feature set as `lit.js` above, but extends `lit-element`'s `LitElement` instead of `lit`'s.

**Differences from `lit.js`:**

| Aspect | `lit.js` | `lit-element.js` |
|---|---|---|
| Base class | `lit.LitElement` | `lit-element.LitElement` (Polymer) |
| SSR support | Yes (`globalThis`) | No (`window`) |
| `shouldNotUpdateWhenInactive` property | Yes | No — `active=false` always suppresses updates |
| `active` default in `connectedCallback` | Not set | Set to `true` |

---

#### Global Configuration for LitElement Wrappers

Set `globalThis.dw.pwaHelpers.LitElementConfig` before the module is imported.

| Key | Type | Default | Description |
|---|---|---|---|
| `debugRender` | `Boolean` | `false` | Tracks per-instance render counts. Access via `LitElement.getUpdatedSummary()`. |
| `debugPropChanges` | `Boolean` | `false` | Logs `console.log` on every property change with old/new values. |
| `disabled` | `Boolean` | `false` | When `true`, exports the raw upstream `LitElement` instead of `DwLitElement`. |

```javascript
// Set before import:
window.dw = { pwaHelpers: { LitElementConfig: { debugRender: true } } };
```

---

#### `localize.js` — `localize(i18next?)(BaseElement)`

Mixin that integrates i18next into a LitElement. Triggers re-render when i18next initializes, language changes, or a namespace loads.

**Usage:**

```javascript
import localize from '@dreamworld/pwa-helpers/localize.js';
import i18next from 'i18next';

class MyView extends localize(i18next)(LitElement) {
  constructor() {
    super();
    this.i18nextNameSpaces = ['common', 'myModule'];
  }

  render() {
    return html`<p>${this.t('greeting')}</p>`;
  }
}
```

If the `i18next` argument is omitted, the default `i18next` module instance is used.

**Properties:**

| Property | Type | Attribute | Reflected | Description |
|---|---|---|---|---|
| `_language` | `String` | `lang` | Yes | Current i18next language code. Set automatically; triggers re-render. |
| `_textReady` | `Boolean` | — | No | `true` once i18next is initialized and all `i18nextNameSpaces` are loaded. |
| `request` | `Object` | — | No | SSR input. `request.i18n` is used as the i18next instance server-side. |

**Instance properties (set in constructor, not reactive):**

| Property | Type | Description |
|---|---|---|
| `i18nextNameSpaces` | `String[]` | Namespaces to load on `connectedCallback`. Default: none. |

**Getters:**

| Getter | Return Type | Description |
|---|---|---|
| `language` | `String` | Returns `request.i18n.language` (SSR) or `_language` (client). |
| `i18next` | `Object` | Returns `request.i18n` (SSR) or the client-side i18next instance. |

**Methods:**

| Method | Signature | Description |
|---|---|---|
| `t` | `(keys, options?) => String` | Delegates to `this.i18next.t()`. |
| `exists` | `(keys, options?) => Boolean` | Delegates to `this.i18next.exists()`. |
| `_setLanguage` | `(newLanguage: String) => void` | Protected. Sets `_language`. Override to add custom logic on language change; call `super._setLanguage()`. |

---

#### `metadata.js` — `updateMetadata` / `setMetaTag`

Imperative utilities for setting Open Graph and Twitter card `<meta>` tags.

**`updateMetadata({ title, description, url, image, imageAlt })`**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `title` | `String` | No | Sets `document.title` and `og:title`. |
| `description` | `String` | No | Sets `description` and `og:description`. |
| `url` | `String` | No | Sets `og:url`. Defaults to `window.location.href`. |
| `image` | `String` | No | Sets `og:image`. |
| `imageAlt` | `String` | No | Sets `og:image:alt`. |

**`setMetaTag(attrName, attrValue, content)`**

Creates or updates a `<meta>` element in `<head>` matching `meta[attrName="attrValue"]`.

| Parameter | Type | Description |
|---|---|---|
| `attrName` | `String` | Attribute name to query by, e.g. `'name'` or `'property'`. |
| `attrValue` | `String` | Attribute value to match, e.g. `'og:title'`. |
| `content` | `String` | Value for the `content` attribute. |

---

#### `page-metadata.js` — `pageMetadata(BaseElement)`

Mixin that calls `updateMetadata` when the page becomes active. Skips the update if metadata hasn't changed since the last call (deep equality via lodash `isEqual`).

**Usage:**

```javascript
import { pageMetadata } from '@dreamworld/pwa-helpers/page-metadata.js';

class MyPage extends pageMetadata(LitElement) {
  static get properties() {
    return { active: { type: Boolean, reflect: true } };
  }

  _getPageMetadata() {
    return {
      title: 'My Page',
      description: 'Page description',
      url: window.location.href,
    };
  }
}
```

**Properties:**

| Property | Type | Reflected | Description |
|---|---|---|---|
| `active` | `Boolean` | Yes | When `true`, triggers metadata update. When `false`, resets the stored metadata cache. |

**Methods to override:**

| Method | Signature | Description |
|---|---|---|
| `_getPageMetadata` | `() => Object \| undefined` | Protected. Return an object accepted by `updateMetadata`. Return `undefined` or empty object to skip update. |

---

#### `lazy-reducer-enhancer.js` — `lazyReducerEnhancer(combineReducers)`

A Redux store enhancer that adds a `store.addReducers(newReducers)` method for lazy-installing reducers after store creation.

**Usage:**

```javascript
import { createStore, combineReducers, compose } from 'redux';
import { lazyReducerEnhancer } from '@dreamworld/pwa-helpers/lazy-reducer-enhancer.js';

export const store = createStore(
  (state, action) => state,
  compose(lazyReducerEnhancer(combineReducers))
);

// Later, in a lazy-loaded module:
store.addReducers({ someReducer });
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `combineReducers` | `Function` | Redux's `combineReducers` (or a compatible alternative). |

**Added store method:**

| Method | Signature | Description |
|---|---|---|
| `addReducers` | `(newReducers: Object) => void` | Merges `newReducers` into the existing lazy reducer map and calls `store.replaceReducer`. |

---

#### `redux-persist-enhancer.js` — `persistEnhancer(persistOptions, filterFn?)`

Redux store enhancer that persists specified state paths to `localStorage`. Supports rehydration on page load and optional real-time cross-tab state synchronization.

**Usage:**

```javascript
import { createStore, compose } from 'redux';
import { persistEnhancer } from '@dreamworld/pwa-helpers/redux-persist-enhancer.js';

const store = createStore(
  rootReducer,
  compose(
    persistEnhancer([
      'user.preferences',
      { path: 'session.token', sharedBetweenTabs: true }
    ])
  )
);
```

**`persistEnhancer(persistOptions, filterFn?)`**

| Parameter | Type | Description |
|---|---|---|
| `persistOptions` | `Array<String \| Object>` | Paths to persist. Each entry is a dot-separated path string or a config object (see below). |
| `filterFn` | `Function` (optional) | `(preloadedState) => filteredState` — filters the rehydrated state before it is applied to the store. |

**`persistOptions` entry shape (object form):**

| Field | Type | Default | Description |
|---|---|---|---|
| `path` | `String` | — | Dot-separated path in the state tree, e.g. `'user.profile'`. |
| `sharedBetweenTabs` | `Boolean` | `false` | When `true`, writes to `localStorage` immediately on state change and applies changes from other tabs in real time. |

**Internal behavior:**
- State is persisted to `localStorage` on the browser `pagehide` event and, in Cordova apps, on the `pause` event.
- Keys are stored with prefix `__Redux_persist_.` (e.g. `__Redux_persist_.user.preferences`).
- Cross-tab sync dispatches internal action `@@APPLY_PERSIST_CHANGES`, handled by a wrapper reducer.
- `store.replaceReducer` is overridden to preserve the wrapper reducer across lazy reducer replacements.

---

#### `redux-utils.js` — `ReduxUtils`

Static utility class for immutable Redux state updates and store subscriptions.

**Methods:**

| Method | Signature | Return | Description |
|---|---|---|---|
| `replace` | `(state, path, value, spliter?)` | `Object` | Immutably sets `value` at dot-separated `path`. Deletes the key if `value === undefined`. |
| `subscribe` | `(store, path, callback)` | `Function` (unsubscribe) | Subscribes to value changes at `path` (string) or multiple paths (array). Fires callback immediately if a current value exists. |
| `onValue` | `(store, paths)` | `Promise` | Resolves once a value exists at the given path(s). Single path returns the value; array returns `{ [path]: value }`. |
| `removeItem` | `(state, path, index)` | `Object` | Removes the array element at `index` from the array at `path`. Throws if value is not an array. |
| `addItems` | `(state, path, items)` | `Object` | Appends one item or an array of items to the array at `path`. Creates a new array if none exists. |
| `replaceItem` | `(state, path, predicateOrIndex, newItem)` | `Object` | Replaces an array element matched by lodash predicate or by numeric index. No-op if index is `< 0`. |

**`subscribe` callback signatures:**

- Single path (`path: String`): `callback(newValue)`
- Multiple paths (`path: String[]`): `callback([{ path, value }, ...])`

**Example:**

```javascript
import { ReduxUtils } from '@dreamworld/pwa-helpers/redux-utils.js';

// Immutable replace
const newState = ReduxUtils.replace(state, 'user.name', 'Alice');

// Subscribe to a single path
const unsubscribe = ReduxUtils.subscribe(store, 'user.name', value => {
  console.log('name changed to', value);
});

// Wait for a value to appear
const token = await ReduxUtils.onValue(store, 'auth.token');

// Wait for multiple values
const { 'auth.token': token, 'user.id': userId } = await ReduxUtils.onValue(store, ['auth.token', 'user.id']);
```

---

#### `utils.js` — `isElementAlreadyRegistered(elName)`

Checks whether a custom element has already been registered in the `customElements` registry or the Polymer telemetry registry.

**Usage:**

```javascript
import { isElementAlreadyRegistered } from '@dreamworld/pwa-helpers/utils.js';

if (!isElementAlreadyRegistered('my-element')) {
  customElements.define('my-element', MyElement);
}
```

| Parameter | Type | Description |
|---|---|---|
| `elName` | `String` | The custom element tag name to check. |

**Returns:** `Boolean` — `true` if already registered. Always returns `false` on SSR.

---

## 2. Developer Guide / Architecture

### Architecture Overview

This library is composed entirely of **higher-order function mixins** (class factory pattern) and **standalone utility functions**. There are no runtime singletons or global registries beyond the optional `dw.pwaHelpers.LitElementConfig` configuration object.

**Design patterns used:**

| Pattern | Where used |
|---|---|
| **Mixin / Class Factory** | All `*Mixin`, `focusable`, `focusWithin`, `buttonFocus`, `connect`, `localize`, `pageMetadata` — each is `(BaseElement) => class extends BaseElement { }` |
| **Redux Enhancer** | `lazyReducerEnhancer`, `persistEnhancer` — follow the `(nextCreator) => (reducer, preloadedState) => store` contract |
| **Observer** | `connect-mixin` subscribes to the Redux store; `redux-persist-enhancer` subscribes to `localStorage` storage events and Redux state changes for cross-tab sync |
| **Template Method** | `pageMetadata` defines `_getPageMetadata()` as a hook for subclasses to override |
| **Facade** | `metadata.js` / `page-metadata.js` abstract DOM `<meta>` manipulation behind a plain object interface |
| **Module-level shared state** | `updatesCount` / `instancesCount` in `lit.js` and `lit-element.js` are module-scoped variables shared across all element instances |

**Module dependency graph (simplified):**

```
focusable.js
  └── focus-within.js
        └── bowser

focusable-item.js
  ├── focusable.js → focus-within.js → bowser
  └── lit-element.js → lit-element (npm)

localize.js
  ├── lit.js → lit (npm)
  └── i18next

redux-persist-enhancer.js
  ├── redux-utils.js
  └── lodash-es

connect-mixin.js          (no internal deps)
layout-mixin.js           → lit.js (isServer)
button-focus.js           → bowser
page-metadata.js          → lodash-es
metadata.js               (no deps)
lazy-reducer-enhancer.js  (no deps)
utils.js                  → lit (isServer)
```

**SSR compatibility summary:**

| Module | SSR-safe |
|---|---|
| `lit.js` | Yes |
| `localize.js` | Yes |
| `layout-mixin.js` | Yes |
| `utils.js` | Yes |
| `connect-mixin.js` | Yes (via `request.store`) |
| `lit-element.js` | No (`window` access) |
| `button-focus.js` | No (`window.navigator`) |
| `focus-within.js` | No (`window.navigator`) |
| `redux-persist-enhancer.js` | No (`window.localStorage`) |
| `metadata.js` | No (`document`, `window.location`) |
| `page-metadata.js` | No (`document`, `window.location`) |
