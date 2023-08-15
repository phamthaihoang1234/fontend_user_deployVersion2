import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification } from '../common/Notification';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // url = 'http://localhost:8080/api/notification';

  url = environment.API_SERVER + 'api/notification';

  constructor(private http: HttpClient) { }

  post(notification: Notification) {
    return this.http.post(this.url, notification);
  }

  get() {
    return this.http.get(this.url);
  }

  readed(id: number) {
    return this.http.get(this.url+'/readed/'+id);
  }
}
