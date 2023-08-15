import { Cart } from "./Cart";
import { CartDetail } from "./CartDetail";
import { OrderDetail } from "./OrderDetail";

export class OrderRequestGuess {
    'cart': Cart;
    'orderDetails': CartDetail[];
    

    constructor(cart:Cart , orderDetails : CartDetail[]) {
        this.cart = cart;
        this.orderDetails = orderDetails;
    }
}