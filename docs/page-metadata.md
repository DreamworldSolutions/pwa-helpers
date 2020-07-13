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

##### You must have to override `_getPageMetadata` return your page metadata.

```javascript
//Import page-metadata mixin
import pageMetadata from '@dreamworld/pwa-helpers/page-metadata.js'

//Import lit-element class
import { LitElement } from 'lit-element'

//Apply focus-within mixin to lit-element class
class DwPage extends pageMetadata(LitElement) {

  /**
   * You must have to override `_getPageMetadata` this method to return your page metadata.
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

This mixin will work on `firstUpdated` or `updated` life-cycle methods of `LitElement` and when `attributeChangedCallback` callback is called.

When current item is disabled then remove tabindex attribute from host-element using `removeAttribute` (HTML DOM method).
Otherwise, set tabindex attribute as a `0` to item using `setAttribute` HTML DOM method.

## methods
