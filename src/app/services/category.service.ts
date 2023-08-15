import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  

  // url = "http://localhost:8080/api/categories";

  url = environment.API_SERVER + 'api/categories';
  
  constructor(private httpClient: HttpClient) { }
  
  getAll() {
    return this.httpClient.get(this.url);
  }

  getAllBestSeller() {
    return this.httpClient.get(this.url+'/bestseller');
  }

  getOne(id: number) {
    return this.httpClient.get(this.url + '/' + id);
  }
}
