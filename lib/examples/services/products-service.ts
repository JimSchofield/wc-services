import { Service } from "../../base-service";

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

export default class ProductsService extends Service {
  products: Product[] = [];

  selectedID = -1;

  get selectedProduct() {
    return this.products.find(({id}) => id === this.selectedID);
  }

  constructor() {
    super();

    this.fetchProducts();
  }

  fetchProducts() {
    fetch(`https://fakestoreapi.com/products`)
      .then((res) => res.json())
      .then((data) => {
        this.products = data;
        this.notify();
      });
  }

  selectProduct(id: number) {
    this.selectedID = id;
    this.notify();
  }
}
