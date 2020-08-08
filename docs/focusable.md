# focusable

Mixin to apply focusable behavior to Element.

Generally you can make any element focusable by adding an attribute `tabindex`. But, style for `:host(:focus)` isn't working for 
IE/Edge. So, this behavior actually extends `focusWithin` behavior. So, you can get everything ready to be worked. And that solution
works across all the browsers flawlessly.

If you want to use focusable element as wrapper to your code, you may use [`focusable-item`](focusable-item.md)

## How to Use

### Install
```
npm install --save @dreamworld/pwa-helpers
```

### Import
```javascript
import { LitElement, html, css } from '@dreamworld/pwa-helpers/lit-element';
import { focusable } from './focusable';
```

### Use (Apply mixin to view element)
```javascript
export class MyElement extends focusable(LitElement) {

}
window.customElements.define('my-element', MyElement);
```
