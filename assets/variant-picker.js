import {Component} from "@theme/component";

class VariantPicker extends Component{
  constructor() {
    super();
  }

  connectedCallback(){
    this.addEventListener("change", this.#onVariantChange.bind(this));
  }

  #onVariantChange(event){
    const {sectionId, productUrl} = this.dataset;
    let url = `${productUrl}?sectionId=${sectionId}`;
    let valueIds = []
    const checked = this.querySelectorAll('input:checked');
    checked.forEach((el) => {
      valueIds.push(el.dataset.valueId);
    })
    if(valueIds.length !== 0){
      url = `${url}&option_values=${valueIds.join(',')}`;
    }

    fetch(url)
      .then(response => response.text())
      .then((text) => {
        console.log(json);
      })
  }
}

if(!customElements.get("variant-picker")) {
  customElements.define("variant-picker", VariantPicker);
}