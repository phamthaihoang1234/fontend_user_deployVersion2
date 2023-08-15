import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../common/Customer';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  

  // url = "http://localhost:8080/api/auth";

  url = environment.API_SERVER + 'api/auth';

  constructor(private httpClient: HttpClient) { }

  getOne(id: number) {
    return this.httpClient.get(this.url + '/' + id);
  }

  getByEmail(email: string) {
    return this.httpClient.get(this.url + '/email/' + email);
  }

  update(id: number, customer: Customer) {
    return this.httpClient.put(this.url + '/' + id, customer);
  }
}
