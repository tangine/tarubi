export class DeclarativeShadowElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const template = this.querySelector(':scope > template[shadowrootmode="open"]');

      if (!(template instanceof HTMLTemplateElement)) return;

      const shadow = this.attachShadow({ mode: 'open' });
      shadow.append(template.content.cloneNode(true));
    }
  }
}

export class Component extends DeclarativeShadowElement {
  get roots() {
    return this.shadowRoot ? [this, this.shadowRoot] : [this];
  }
}