import {Component} from "./component";

class QuantitySelector extends Component {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {}

  getValue() {}

  setValue(value) {}

  dispatchChangeEvent(event) {
    this.dispatchEvent(new Event('change', {
      value: Number(this.value)
    }));
  }
}