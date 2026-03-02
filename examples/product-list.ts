import { html } from "lighterhtml";
import { lazyService } from "../lib/index.ts";
import Component from "./component.ts";
import ProductsService from "./services/products-service.ts";
import CartService from "./services/cart-service.ts";

export class ProductList extends Component {
  constructor() {
    super();

    lazyService(this, "productsService", ProductsService, () => this.notify());
    lazyService(this, "cartService", CartService, () => this.notify());
  }
  declare productsService: ProductsService;
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
