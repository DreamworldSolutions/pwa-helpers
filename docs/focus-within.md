# focus-within

The `:focus-within` is not supported in `edge/ie` browser, So this mixin provides a solution to write CSS in `edge/ie` browser.


The `:focus-within` CSS pseudo-class represents an element that has received focus or contains an element that has received focus. In other words, it represents an element that is itself matched by the :focus pseudo-class or has a descendant that is matched by `:focus` (This includes descendants in shadow trees).

This selector is useful, to take a common example, for highlighting an entire `<form>` container when the user focuses on one of its `<input>` fields.

More information on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-within).


## How to use

#### Installation
```sh
npm install --save @dreamworld/pwa-helpers
```

#### Usage

##### Apply Mixin to your view-element Class.
```javascript
//Import focus-within mixin
@import {focusWithin} from '@dreamworld/pwa-helpers';
	
//Import lit-element class
@import {LitElement} from 'lit-element';
	
//Apply focus-within mixin to lit-element class
class DwListItem extends focusWithin(LitElement) {}
```

##### How to write focus/focus-within css?
```css
//Don't write css like this for all browser.
//This css isn't working in edge browser, because :host(:focus) css selector is ignored in edge/ie browser.
:host([focus]),
:host([focus-within]),
:host(:focus),
:host(:focus-within) {
  background-color: var(--mdc-theme-primary, #6200ee);
}

//For edge/ie browser
:host([focus]),
:host([focus-within]) {
  background-color: var(--mdc-theme-primary, #6200ee);
}

//For other browser
:host(:focus),
:host(:focus-within) {
  background-color: var(--mdc-theme-primary, #6200ee);
}
```

## How it works

This mixin will add four events(`focus`, `blur`, `focusin`, and `focusout`) listeners, to trigger the automatic apply and remove of a custom attributes(`focus` and `focus-within`).