import { notify } from "../../base-service";
import { Product } from "./products-service";

type ProductInCart = {
  product: Product;
  count: number;
};

export const cartService = {
  isOpen: false,
  cart: [] as ProductInCart[],
  toggleCart() {
    this.isOpen = !this.isOpen;
    notify(this);
  },
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

    notify(this);
  },
  getProductInCard(product: Product) {
    return this.cart.find(({ product: { id } }) => product.id === id);
  },
  numberInCart(product: Product) {
    return this.getProductInCard(product)?.count;
  },
};
