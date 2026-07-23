import {Component} from "./component";

class QuantitySelector extends Component {
  static get ObservedAttributes() {
    return ['value', 'min'];
  }

  #value
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }


  disconnectedCallback() {
    super.disconnectedCallback();
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if(attrName === 'value') {
      this.#value = newValue;
    }
  }

  #getValue() {}

  #setValue(value) {}

  #increase() {
    this.#value += 1;
    this.#updateValue()
  }

  #decrease() {
    this.#value -= 1;
    this.#updateValue();
  }

  #updateValue(event) {
    this.dispatchEvent(new CustomEvent('change',{
      bubbles: true,
      composed: true,
      detail: {
        value: this.#getValue(),
      }
    }));
  }

  #render() {
    this.shadowRoot.innerHTML = '<div><button class="minus">-</button><input type="number" value="${this.#value}"><button class="plus">+</button></div>';
  }
}