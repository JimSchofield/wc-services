import { html } from "lighterhtml";
import { service } from "../lib/index.ts";
import Component from "./component.ts";
import CartService from "./services/cart-service.ts";

const styles = html`
  <style>
    dialog[open] {
      margin: unset;
      inset-inline-start: unset;
      inset-inline-end: 0;
      inset-block-start: 0;
      inset-block-end: 0;
      width: 300px;
    }
    dialog {
      position: fixed;
    }
    .top {
      display: flex;
      justify-content: space-between;
    }
    .cart {
      list-style: none;
      padding: 0;
    }
    .cart--item {
      padding: .5em 0;
      display: flex;
      justify-content: space-between;
      gap: 2em;
    }
  </style>
`;

export class ShoppingCart extends Component {
  getMountPoint() {
    return this.attachShadow({ mode: "open" });
  }

  cartService = service(this, CartService, () => this.notify());

  render() {
    return html`
      ${styles}
      <dialog open=${this.cartService.isOpen}>
        <div class="top">
          Cart
          <button onclick=${() => this.cartService.toggleCart()}>Close</button>
        </div>
        <div>${this.cartService.cart.length} items</div>
        <div>
          ${this.cartService.cart.length > 0
            ? html`<ul class="cart">
                ${this.cartService.cart.map((productInCart) => {
                  return html`<li class="cart--item">
                    <div>${productInCart.product.title}</div>
                    <div>${productInCart.count}</div>
                  </li>`;
                })}
              </ul>`
            : html`<p>Cart Empty</p>`}
        </div>
      </dialog>
    `;
  }
}

customElements.define("shopping-cart", ShoppingCart);
