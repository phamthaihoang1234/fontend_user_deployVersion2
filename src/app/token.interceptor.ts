import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './services/session.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private sessionService: SessionService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    // Lấy token từ lưu trữ nơi bạn đã lưu nó (localStorage, sessionStorage, v.v.)
    const token = this.sessionService.getToken(); // Thay 'token' bằng khóa lưu trữ của bạn

    // Kiểm tra nếu token tồn tại, thêm nó vào tiêu đề 'Authorization'
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      request = request.clone({ headers });
    }

    return next.handle(request);
  }
}
