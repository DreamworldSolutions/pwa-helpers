# page-metadata

Provide a way to change page metadata. like title, description.

## How to use

#### Installation

```sh
npm install --save @dreamworld/pwa-helpers
```

#### Usage

##### Apply Mixin to your view-element Class.

```javascript
//Import button-focus mixin
import pageMetadata from '@dreamworld/pwa-helpers/page-metadata.js'

//Import lit-element class
import { LitElement } from 'lit-element'

//Apply page-metadata mixin to lit-element class
class Dwpage extends pageMetadata(LitElement) {}
```

##### You must have to override `_getPageMetadata` method to return your page metadata.

```javascript
//Import page-metadata mixin
import pageMetadata from '@dreamworld/pwa-helpers/page-metadata.js'

//Import lit-element class
import { LitElement } from 'lit-element'

//Apply focus-within mixin to lit-element class
class DwPage extends pageMetadata(LitElement) {

  /**
   * Override this method to return your page metadata.
   * If not overriden, this behavior doesn't work, silently. And won't log any error either.
   */
  _getPageMetadata () {
    return {
      title: 'My App - view 1',
      description: 'This is my sample app',
      url: window.location.href,
      image: '/assets/view1-hero.png'
    }
  }
}
```

## How it works

This mixin will work on `updated` life-cycle methods of `LitElement`.

When current page metadata is defined in `_getPageMetadata` and previous and new page metadata is not same and page is active then change page metadata change using [updateMetadata](https://github.com/polymer/pwa-helpers#metadatajs) method of lit-element pwa-helapers.

When page is in-active then reset private instance property `__pageMetaData` is reset, because next time page is active then set page metadata.
