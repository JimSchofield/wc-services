import { service } from "../lib";
import MyFirstService from "./my-first-service";

class MyComponent extends HTMLElement {
  property = service(this, MyFirstService);

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.shadowRoot!.innerHTML = `
<div>${this.property.value}</div>
`;
  }
}

customElements.define("my-component", MyComponent);
