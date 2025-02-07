import { Service } from "../../base-service";
import { reactive } from "../../decorators/reactive";

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
  @reactive products: Product[] = [];

  @reactive selectedID = -1;

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
      });
  }

  selectProduct(id: number) {
    this.selectedID = id;
  }
}
