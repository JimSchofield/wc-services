import { html } from "lighterhtml";
import { service } from "../lib/decorators/service.ts";
import Component from "./component.ts";
import CartService from "./services/cart-service.ts";
import ProductsService from "./services/products-service.ts";

export class MyProduct extends Component {
  @service(ProductsService, (host: MyProduct) => host.notify())
  declare productsService: ProductsService;

  @service(CartService, (host: MyProduct) => host.notify())
  declare cartService: CartService;

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
