import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {

  // provinces = 'https://provinces.open-api.vn/api/p'
  // districts = 'https://provinces.open-api.vn/api/p';
  // wards = 'https://provinces.open-api.vn/api/d';

  // province = 'https://provinces.open-api.vn/api/p/';
  // district = 'https://provinces.open-api.vn/api/d/';  
  // ward = 'https://provinces.open-api.vn/api/w/';


  // provinces = 'http://localhost:8080/api/provinces'
  // districts = 'http://localhost:8080/api/districts';
  // wards = 'http://localhost:8080/api/wards';

  // province = 'http://localhost:8080/api/province';
  // district = 'http://localhost:8080/api/district';  
  // ward = 'http://localhost:8080/api/ward';


  provinces = environment.API_SERVER + 'api/provinces';
  districts = environment.API_SERVER + 'api/districts';
  wards = environment.API_SERVER + 'api/wards';
  province = environment.API_SERVER + 'api/province';
  district = environment.API_SERVER + 'api/district';
  ward = environment.API_SERVER + 'api/ward';

  constructor(private http: HttpClient) { }

  getAllProvinces() {
    return this.http.get(this.provinces);
  }

 

  getDistricts(code:number) {
    return this.http.get(this.districts+'/'+code);
  }

  getWards(code:number) {
    return this.http.get(this.wards+'/'+code);
  }

  getProvince(id: number) {
    return this.http.get(this.province+'/'+id);
  }

  getDistrict(id: number) {
    return this.http.get(this.district+'/'+id);
  }

  getWard(id: number) {
    return this.http.get(this.ward+'/'+id);
  }

  
}
