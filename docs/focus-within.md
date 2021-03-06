# DEPRECATED
***These problems are solved with the latest chromium version of Edge.***

***For safari, we got an alternative css fix/hack***
Use `:host(my-element:focus-within)` instead of `:host(:focus-within)`

# focus-within

There are 2 problems in Microsoft IE/Edge:

1. For WebComponents, `:host(:focus)` CSS doesn't work. Note:: `:focus` css works at other places (other than `:host`)
2. The `:focus-within` is not supported in `edge/ie` browser. This is in general either used with `:host` or not.


So this mixin provides solutions to the above CSS problems in `edge/ie` browser. It sets `focus` and `focus-within` attributes on Host element, for IE/Edge browser. So, we can write CSS based on the host attribute.


The `:focus-within` CSS pseudo-class represents an element that has received focus or contains an element that has received focus. In other words, it represents an element that is itself matched by the :focus pseudo-class or has a descendant that is matched by `:focus` (This includes descendants in shadow trees).

This selector is useful, to take a common example, for highlighting an entire `<form>` container when the user focuses on one of its `<input>` fields.

More information on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-within).

> Recently we have noticed that this is needed for all the browsers running on
>  iOS 13.4. So, this is auto-enabled for iOS as well.


## How to use

#### Installation
```sh
npm install --save @dreamworld/pwa-helpers
```

#### Usage

##### Apply Mixin to your view-element Class.
```javascript
//Import focus-within mixin
import {focusWithin} from '@dreamworld/pwa-helpers';
	
//Import lit-element class
import {LitElement} from '@dreamworld/pwa-helpers/lit-element';
	
//Apply focus-within mixin to lit-element class
class DwListItem extends focusWithin(LitElement) {}
```

##### How to write focus/focus-within css?

**IMPORTANT!!!!!**
```css
//Don't write css like this for all browser.
//This css isn't working in edge browser, because :host(:focus) css selector is ignored in edge/ie browser.
:host([focus]),
:host([focus-within]),
:host(:focus),
:host(:focus-within) {
  background-color: var(--mdc-theme-primary, #6200ee);
}

//Instead, you need to write your CSS (duplicated) as follows. We don't know why, by above syntax doesn't work.

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
