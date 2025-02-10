import { html } from "lighterhtml";
import { service } from "../index.ts";
import Component from "./component.ts";
import { productService } from "./services/products-service.ts";
import { cartService } from "./services/cart-service.ts";

export class ProductList extends Component {
  productsService = service(this, "productService", productService, () => this.notify());
  cartService = service(this, "cartService", cartService, () => this.notify());

  selectedProduct: number = -1;

  render() {
    return html`
      <div>
        <button onclick=${() => this.cartService.toggleCart()}>Toggle Shopping Cart</button>
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
