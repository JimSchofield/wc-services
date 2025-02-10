import { html } from "lighterhtml";
import { service } from "../index.ts";
import Component from "./component.ts";
import { cartService } from "./services/cart-service.ts";
import { productService } from "./services/products-service.ts";

export class MyProduct extends Component {
  productsService = service(this, "productService", productService, () => this.notify());
  cartService = service(this, "cartService", cartService, () => this.notify());

  get selected() {
    return this.productsService.selectedProduct;
  }

  addToCart = () => {
    this.cartService.addProduct(this.selected);
  };

  render() {
    if (!this.selected) return null;

    return html`
      <div>${this.selected.title}</div>
      <div><img src=${this.selected.image} width="200px" /></div>

      <button onclick=${this.addToCart}>
        Add to cart${this.getNumberInCartRendering()}
      </button>
    `;
  }

  getNumberInCartRendering() {
    if (!this.selected) return null;

    const number = this.cartService.numberInCart(this.selected);

    if (!number) {
      return ``;
    }

    return ` (${number} in cart)`;
  }
}

customElements.define("my-product", MyProduct);
