class CartItem extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("quantity-change", this.onQuantityChange.bind(this));
  }

  onQuantityChange(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("onQuantityChange", event);
  }

  onItemRemove(event) {
    event.preventDefault();
    event.stopPropagation();
  }
}

if(!customElements.get("cart-item")) {
  console.log("Cart is missing");
  customElements.define("cart-item", CartItem);
}
