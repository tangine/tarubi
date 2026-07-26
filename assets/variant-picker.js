import {Component} from "@theme/component";

class VariantPicker extends Component{
  constructor() {
    super();
  }

  connectedCallback(){
    this.addEventListener("change", this.#onVariantChange.bind(this));
  }

  #onVariantChange(event){
    const checked = this.querySelectorAll('input:checked');
    checked.forEach((el) => {
      console.log(el.dataset);
    })
  }
}

if(!customElements.get("variant-picker")) {
  customElements.define("variant-picker", VariantPicker);
}