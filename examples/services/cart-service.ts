import { reactive } from '../../lib/decorators/reactive';
import { Service } from "../../lib/base-service";
import { Product } from "./products-service";

type ProductInCart = {
  product: Product;
  count: number;
};

export default class CartService extends Service {
  @reactive isOpen = false;
  @reactive cart: ProductInCart[] = [];

  toggleCart() {
    this.isOpen = !this.isOpen;
  }

  addProduct(product?: Product) {
    if (!product) return;

    const productInCart = this.cart.find(
      ({ product: { id } }) => product.id === id,
    );
    if (productInCart) {
      productInCart.count++;
    } else {
      this.cart.push({ product, count: 1 });
    }

    this.notify();
  }

  getProductInCard(product: Product) {
    return this.cart.find(({ product: { id } }) => product.id === id);
  }

  numberInCart(product: Product) {
    return this.getProductInCard(product)?.count;
  }
}
