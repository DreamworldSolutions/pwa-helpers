# button-focus

The button(`<button></button>` OR `<input type=button />`) focus is not working(with tabindex or without tabindex) in `iPhone/safari`, `iPhone/chrome` and `macbook/safari` this browser, So this mixin provide a solution to at least focus on his parent.

This mixins use with your custom button element like `dw-button` or `dw-icon-button`.

More information on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus).


## How to use

#### Installation
```sh
npm install --save @dreamworld/pwa-helpers
```

#### Usage

##### Apply Mixin to your view-element Class.
```javascript
//Import button-focus mixin
import {buttonFocus} from '@dreamworld/pwa-helpers';
	
//Import lit-element class
import {LitElement} from 'lit-element';
	
//Apply focus-within mixin to lit-element class
class DwButton extends buttonFocus(LitElement) {}
```

##### You must have to call `super` when writing `firstUpdated`, `updated` and `attributeChangedCallback` methods in your element.

```javascript
//Import button-focus mixin
import {buttonFocus} from '@dreamworld/pwa-helpers';
	
//Import lit-element class
import {LitElement} from 'lit-element';

//Apply focus-within mixin to lit-element class
class DwButton extends buttonFocus(LitElement) {
  attributeChangedCallback(name, oldval, newval) {

    //Called super attributeChangedCallback method.
    super.attributeChangedCallback(name, oldval, newval);

    //Here write your code.
  }

  firstUpdated(changedProperties) {

    //Called super firstUpdated method.
    super.firstUpdated(changedProperties);

    //Here write your code.
  }

  updated(changedProperties) {
    //Called super updated method.
    super.updated(changedProperties);

    //Here write your code.
  }
}
```

## How it works

This mixin will work on `firstUpdated` or `updated` lit-element method invoked and `attributeChangedCallback` callback is called. 

When current item is disabled then remove tabindex attribute from item using `removeAttribute` HTML DOM method),
Otherwise set tabindex attribute as a `0` to item using `setAttribute` HTML DOM method.

## Properties

| Name  | Type | Description |
| ----  | ---- | ----------- |
| disabled | Boolean | Current element is disabled or not.  |
| buttonFocusDisabled | Boolean | Button focus mixin is work or not.  |
| tabindex | Number | Set tabindex for undisabled item. Default value is 0(Zero).|



