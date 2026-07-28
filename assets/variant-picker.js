import {Component} from "@theme/component";

class VariantPicker extends Component{
  #abortController = new AbortController();
  constructor() {
    super();
  }

  connectedCallback(){
    this.addEventListener("change", this.#onVariantChange.bind(this));
  }

  disconnectedCallback(){
    this.#abortController?.abort()
  }

  #onVariantChange(event){
    const {sectionId, productUrl} = this.dataset;
    let url = `${productUrl}?sectionId=${sectionId}`;
    let options = this.#getAllSelectedOptions()

    console.log(options);
    const optionValues = []
    options.forEach(option => {
      optionValues.push(option.optionValueId);
    })

    url = `${url}&option_values=${optionValues.join(",")}`;


    const {signal} = this.#abortController

    fetch(url, {signal})
      .then(response => response.text())
      .then((text) => {
        const newPage = new DOMParser().parseFromString(text, 'text/html');
        document.getElementById(sectionId).innerHTML = newPage.getElementById(sectionId).innerHTML;
      })
  }

  #getAllSelectedOptions() {
    const options = [];
    this.querySelectorAll('fieldset, .product-form__input--dropdown').forEach((group) => {
      const checked = group.querySelector('input:checked') || group.querySelector('select option[selected]');
      if (checked) {
        options.push({...checked.dataset});
      }
    });
    return options;
  }
}

if(!customElements.get("variant-picker")) {
  customElements.define("variant-picker", VariantPicker);
}