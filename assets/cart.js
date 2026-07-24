class CartItem extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("quantity-change", this.onQuantityChange.bind(this));
  }

  onQuantityChange(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("onQuantityChange", event);
    const data = {
      id: this.dataset.cartId,
      quantity: event.detail.value,
    }
    fetch("/cart/change", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(res => res.json())
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
