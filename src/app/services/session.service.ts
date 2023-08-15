import { Injectable } from '@angular/core';
import { Email } from '../common/Email';
import { Login } from '../common/Login';
import jwt_decode from 'jwt-decode';
import { CartDetail } from '../common/CartDetail';

const TOKEN_KEY = 'auth-token';
const CART_KEY = 'session-cart';
const CART_EXPIRATION_KEY = 'session-cart-expiration';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  login!: Login;
  data!: any;

  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string) {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  
  public saveCartSession(cartListDetails: any) {
    window.sessionStorage.removeItem(CART_KEY);
    window.sessionStorage.setItem(CART_KEY, JSON.stringify(cartListDetails));

    // Set expiration time (1 hour from now)
    const expirationTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour in milliseconds
    window.sessionStorage.setItem(CART_EXPIRATION_KEY, expirationTime.toString());

    // Start timer to clear cartListDetails after expiration time
    setTimeout(() => {
      this.clearCartSession();
    }, 60 * 60 * 1000); // 1 hour in milliseconds
  }

  public getCartSession() {
    const cartData = sessionStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : null;
    // return cartData ? JSON.parse(JSON.stringify(cartData)) : null;
    
  }

  public clearCartSession() {
    window.sessionStorage.removeItem(CART_KEY);
    window.sessionStorage.removeItem(CART_EXPIRATION_KEY);
  }

  public isCartSessionExpired() {
    const expirationTime = sessionStorage.getItem(CART_EXPIRATION_KEY);
    if (expirationTime) {
      const currentTime = new Date().getTime();
      return currentTime >= Number(expirationTime);
    }
    return true;
  }


  public getUser(): any {
    try {
      let email:Email = jwt_decode(String(this.getToken())) as Email;
      return email.sub;
    }
    catch (Error) {
      return null;
    }
  }
}
