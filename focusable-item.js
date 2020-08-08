import { html, css } from 'lit-element';
import { LitElement }  from './lit-element.js';
import { focusable } from './focusable';

/**
 * Behaviours:
 *  - Extends `focusable` behavior.
 */

export class FocusableItem extends focusable(LitElement) {
  static get styles() {
    return css`
      :host{
        display: block;
      }
    `
  }
  
  render() {
    return html`
      <slot></slot>
    `
  }
}

window.customElements.define('focusable-item', FocusableItem);