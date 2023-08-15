import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cart } from '../common/Cart';
import { CartDetail } from '../common/CartDetail';
import { OrderRequestGuess } from '../common/OrderRequestGuess';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // url = "http://localhost:8080/api/orders";

  // urlOrderDetail = "http://localhost:8080/api/orderDetail";

  url = environment.API_SERVER + 'api/orders';
  urlOrderDetail = environment.API_SERVER + 'api/orderDetail';

  constructor(private httpClient: HttpClient) { }

  post(email: string, orderRequest: OrderRequestGuess) {
    return this.httpClient.post(this.url+'/guess/'+email,orderRequest);
  }

  postCartWithUserLogin(email: string, cart: Cart) {
    return this.httpClient.post(this.url+'/'+email,cart);
  }



  get(email:string) {
    return this.httpClient.get(this.url+'/user/'+email,{ withCredentials: true });
  }

  getById(id:number) {
    return this.httpClient.get(this.url+'/'+id);
  }

  getByOrder(id:number) {
    return this.httpClient.get(this.urlOrderDetail+'/order/'+id);
  }

  cancel(id: number) {
    return this.httpClient.get(this.url+'/cancel/'+id);
  }
}
