class QuantitySelector extends HTMLElement {
  constructor() {
    super();
    this.classList.add("quantity-selector");

    this.minusButton = this.querySelector("[name='minus']");
    this.plusButton = this.querySelector("[name='plus']");
    this.quantityInput = this.querySelector("input[name='quantity']");
  }

  connectedCallback() {
    this.minusButton.addEventListener("click", this.#decrease.bind(this));
    this.plusButton.addEventListener("click", this.#increase.bind(this));
    this.quantityInput.addEventListener("change", this.#onInputChange.bind(this));
  }

  #increase(event) {
    event.preventDefault();
    event.stopPropagation();
    this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
    this.update()
  }

  #decrease(event) {
    event.preventDefault();
    this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
    this.update()
  }

  #onInputChange() {
    this.update()
  }

  update() {
    this.dispatchEvent(new CustomEvent("quantity-change", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { quantity: this.quantityInput.value }
    }));
  }
}

if(!customElements.get("quantity-selector")) {
  customElements.define("quantity-selector", QuantitySelector);
}