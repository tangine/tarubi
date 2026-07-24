class CartItem extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("quantity-change", this.onQuantityChange.bind(this));
  }

  onQuantityChange(event) {
    console.log("onQuantityChange", event);
  }
}

if(!customElements.get("cart-item")) {
  console.log("Cart is missing");
  customElements.define("cart-item", CartItem);
}
