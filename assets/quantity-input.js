class QuantityInput extends HTMLElement{
  quantityInput = undefined;
  constructor() {
    super();
    this.classList.add('quantity-input');

    this.quantityInput = this.querySelector('input');
    this.querySelectorAll("button").forEach(button => {
      button.addEventListener('click', this.#onButtonClick.bind(this));
    })
    this.quantityInput.addEventListener('change', this.#onInputChange.bind(this));
  }

  connectedCallback(){
    this.quantityInput = this.querySelector('input');
    this.plusButton = this.querySelector('button[name="plus"]');
  }

  #onButtonClick(event) {
    event.preventDefault();
    if(event.target.name === 'minus') {
      this.quantityInput.stepDown()
    } else {
      this.quantityInput.stepUp()
    }
    this.#updateQuantity();
  }

  #onInputChange(event) {
    this.#updateQuantity();
  }

  #updateQuantity(){
    this.dispatchEvent(new CustomEvent('quantity-change', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        quantity: this.quantityInput.value
      }
    }))
  }
}

if(!customElements.get("quantity-input")){
  customElements.define("quantity-input", QuantityInput);
}