# focusable

- It is mixin to make element focusable. 

## How to Use

### Install
```
npm install --save @dreamworld/pwa-helpers
```

### Import
```javascript
import { LitElement, html, css } from 'lit-element';
import { focusable } from './focusable';
```

### Use (Apply mixin to view element)
```javascript
export class FocusableItem extends focusable(LitElement) {

}
window.customElements.define('focusable-item', FocusableItem);
```
