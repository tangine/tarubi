import {Component} from "./component";

class CartItem extends Component {
  constructor() {
    super();
    console.log("constructor");
    this.addEventListener("click", () => {
      console.log("click");
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

console.log("Cart is loaded");