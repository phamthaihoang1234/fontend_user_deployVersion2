import { Injectable } from '@angular/core';
import { ChatMessage } from '../common/ChatMessage';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  webSocket!: WebSocket;
  chatMessages: ChatMessage[] = [];

  constructor(private toastr: ToastrService,) { }

  public openWebSocket(){
    this.webSocket = new WebSocket('wss://tech-world-6b455a03244d.herokuapp.com/notification');

    this.webSocket.onopen = (event) => {
      console.log('Openshopssss: ', event);
    };

    this.webSocket.onmessage = (event) => {
      // const chatMessageDto = JSON.parse(event.data);
      // let mess: ChatMessage = chatMessageDto as ChatMessage;
      
      // if(mess.user.includes('-1')){
        

      //   this.toastr.info(mess.message, 'Hệ thống');
      // }
      
      // this.chatMessages.push(chatMessageDto);
    };

    this.webSocket.onclose = (event) => {
      console.log('CloseShoppp: ', event);
    };
  }

  public sendMessage(chatMessage: ChatMessage){
    this.webSocket.send(JSON.stringify(chatMessage));
  }

  // public closeWebSocket() {
  //   this.webSocket.close();
  // }
}
