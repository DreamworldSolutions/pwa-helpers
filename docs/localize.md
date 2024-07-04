# Localize

## Overview

- This is a JavaScript mixin that you can use to connect a Custom Element base class to a i18next. The requestUpdate() method will be called when the `i18next is initialized` or `language is changed` or `namespace is loaded`.

## Usage

1. Initialize `i18next` from app-shell.
2. Use `localize` mixin for the View class.
3. Use `this.t()` methods in View element template.

```javascript
// i18next initialization (Should be imported once from app-shell)
import i18next from "i18next";
import Backend from "i18next-xhr-backend";

i18next.use(Backend).init({
  fallbackLng: "en",
  ns: ["app"],
  defaultNS: "app",
  backend: {
    loadPath: "src/locales/{{lng}}/{{ns}}.json",
  },
});

// MyView Class definition

import localize from "@dreamworld/pwa-helpers/localize.js";
import i18next from 'i18next';

class MyView extends localize()(PageViewElement) {
  constructor() {
    super();
    this.i18nextNameSpaces = ["anotherNs", "moduleANs"];
  }

  render() {
    return html`
      <section>this.t('title')</section>
      <section>this.t('anotherNs:message')</section>
      <section>this.t('moduleANs:title')</section>
      <button @click="${(_) => i18next.changeLanguage("hi")}">Hindi</button>
      <button @click="${(_) => i18next.changeLanguage("en")}">English</button>
    `;
  }
}
```
