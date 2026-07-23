class CartItem extends HTMLElement {
  constructor() {
    super();
    console.log("constructor");
    this.addEventListener("click", () => {
      console.log("click", this.dataset);
    })
  }

  connectedCallback() {
    console.log("Component connectedCallback");
  }
}

if(!customElements.get("cart-item")) {
  console.log("Cart is missing");
  customElements.define("cart-item", CartItem);
}
