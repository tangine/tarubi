import {Component} from "@theme/component";

class VariantPicker extends Component{
  constructor() {
    super();
  }

  connectedCallback(){
    this.addEventListener("change", this.#onVariantChange.bind(this));
  }

  #onVariantChange(event){
    console.log(event.target.dataset);
  }
}

if(!customElements.get("variant-picker")) {
  customElements.define("variant-picker", VariantPicker);
}