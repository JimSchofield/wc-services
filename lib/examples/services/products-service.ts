import { notify } from "../../base-service";

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

export const productService = {
  products: [] as Product[],
  selectedID: -1,
  get selectedProduct() {
    return this.products.find(({id}) => id === this.selectedID);
  },
  init() {
    this.fetchProducts();
  },
  fetchProducts() {
    fetch(`https://fakestoreapi.com/products`)
      .then((res) => res.json())
      .then((data) => {
        this.products = data;
        notify(this);
      });
  },
  selectProduct(id: number) {
    this.selectedID = id;
    notify(this);
  }
}
