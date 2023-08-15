import { Cart } from "./Cart";
import { Product } from "./Product";

export class CartDetail {
    'cartDetailId': number;
    'quantity': number;
    'price': number;
    'product': Product;
    'cart': Cart;

    
    setQuantity(quantity: number): void {
        this.quantity = quantity;
    }

    constructor(id: number, quantity: number, price: number, product: Product, cart: Cart) {
        this.cartDetailId = id;
        this.quantity = quantity;
        this.price = price;
        this.product = product;
        this.cart = cart;
    }
}
