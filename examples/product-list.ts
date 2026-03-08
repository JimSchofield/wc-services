import { html } from "lighterhtml";
import { service } from "../lib/decorators/service.ts";
import Component from "./component.ts";
import ProductsService from "./services/products-service.ts";
import CartService from "./services/cart-service.ts";

export class ProductList extends Component {
  @service(ProductsService, (host: ProductList) => host.notify())
  declare productsService: ProductsService;

  @service(CartService, (host: ProductList) => host.notify())
  declare cartService: CartService;

  selectedProduct: number = -1;

  render() {
    return html`
      <div>
        <button onclick=${() => this.cartService.toggleCart()}>
          Toggle Shopping Cart
        </button>
        <ul>
          ${this.productsService.products.length > 0
            ? this.productsService.products.map((product) => {
                return html`<li>
                  <button
                    onclick=${() => {
                      this.productsService.selectProduct(product.id);
                      this.render();
                    }}
                  >
                    ${product.title.slice(0, 20) + "..."}
                  </button>
                </li>`;
              })
            : html`Loading...`}
        </ul>
      </div>
    `;
  }
}

customElements.define("product-list", ProductList);
