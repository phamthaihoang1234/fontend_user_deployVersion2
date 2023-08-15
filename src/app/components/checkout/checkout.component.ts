import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { ChatMessage } from 'src/app/common/ChatMessage';
import { Customer } from 'src/app/common/Customer';
import { District } from 'src/app/common/District';
import { Notification } from 'src/app/common/Notification';
import { Order } from 'src/app/common/Order';
import { OrderRequestGuess } from 'src/app/common/OrderRequestGuess';
import { Province } from 'src/app/common/Province';
import { Ward } from 'src/app/common/Ward';
import { CartService } from 'src/app/services/cart.service';
import { CustomerService } from 'src/app/services/customer.service';
import { NotificationService } from 'src/app/services/notification.service';
import { OrderService } from 'src/app/services/order.service';
import { ProvinceService } from 'src/app/services/province.service';
import { SendmailService } from 'src/app/services/sendmail.service';
import { SessionService } from 'src/app/services/session.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  orderRequest! : OrderRequestGuess;

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];

  isLogin: boolean = false;
  otpcode!: any;

  discount!: number;
  amount!: number;
  amountReal!: number;

  postForm: FormGroup;

  provinces!: Province[];
  districts!: District[];
  wards!: Ward[];

  province!: Province;
  district!: District;
  ward!: Ward;

  amountPaypal !:number;
  provinceCode!: number;
  districtCode!: number;
  wardCode!: number;
  public payPalConfig ? : IPayPalConfig;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    private sessionService: SessionService,
    private orderService: OrderService,
    private location: ProvinceService,
    private customerService: CustomerService,
    private webSocketService: WebSocketService,
    private sendMailService: SendmailService,
    private notificationService: NotificationService) {
    this.postForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'name': new FormControl(null, [Validators.required, Validators.minLength(6)]),
      'phone': new FormControl(null, [Validators.required, Validators.pattern('(0)[0-9]{9}')]),
      'province': new FormControl(0, [Validators.required, Validators.min(1)]),
      'district': new FormControl(0, [Validators.required, Validators.min(1)]),
      'ward': new FormControl(0, [Validators.required, Validators.min(1)]),
      'number': new FormControl('', Validators.required),
      'otp': new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  checkLogin() {
    let email = this.sessionService.getUser();
    this.customerService.getByEmail(email).subscribe(data => {
      this.isLogin = true;
    }, error => {
      
    })
  }

  sendOtp() {

    this.sendMailService.sendMailOtp(this.postForm.value.email).subscribe(data => {
      window.localStorage.removeItem("otp");
      window.localStorage.setItem("otp", JSON.stringify(data));

      this.toastr.success('Chúng tôi đã gửi mã OTP về email của bạn !', 'Hệ thống');
    }, error => {
      if (error.status == 404) {
        this.toastr.error('Email này đã tồn tại trên hệ thống !', 'Hệ thống');
      } else {
        
        this.toastr.warning('Hãy nhập đúng email!', 'Hệ thống');
      }
    });

  }

  ngOnInit(): void {
    this.checkOutPaypal();
    this.webSocketService.openWebSocket();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.discount = 0;
    this.amount = 0;
    this.amountPaypal = 0;
    this.amountReal = 0;
    this.getAllItem();
    this.getProvinces();
    this.checkLogin();
  }

  getAllItem() {
    let email = this.sessionService.getUser();
    if(email != null){
      this.cartService.getCart(email).subscribe(data => {
        this.cart = data as Cart;
        console.log("so dien thoai cart là :" + this.cart.phone);
        this.postForm = new FormGroup({
          'phone': new FormControl(this.cart.phone, [Validators.required, Validators.pattern('(0)[0-9]{9}')]),
          'province': new FormControl(0, [Validators.required, Validators.min(1)]),
          'district': new FormControl(0, [Validators.required, Validators.min(1)]),
          'ward': new FormControl(0, [Validators.required, Validators.min(1)]),
          'number': new FormControl('', Validators.required),
          
        })
        this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
          this.cartDetails = data as CartDetail[];
          this.cartService.setLength(this.cartDetails.length);
          if (this.cartDetails.length == 0) {
            this.router.navigate(['/']);
            this.toastr.info('Hãy chọn một vài sản phẩm rồi tiến hành thanh toán', 'Hệ thống');
          }
          this.cartDetails.forEach(item => {
            this.amountReal += item.product.price * item.quantity;
            this.amount += item.price;
          })
          this.discount = this.amount - this.amountReal;
  
          this.amountPaypal = (this.amount/22727.5);
        });
      });
    }else {
      this.postForm = new FormGroup({
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'name': new FormControl(null, [Validators.required, Validators.minLength(6)]),
        'phone': new FormControl(null, [Validators.required, Validators.pattern('(0)[0-9]{9}')]),
        'province': new FormControl(0, [Validators.required, Validators.min(1)]),
        'district': new FormControl(0, [Validators.required, Validators.min(1)]),
        'ward': new FormControl(0, [Validators.required, Validators.min(1)]),
        'number': new FormControl('', Validators.required),
        'otp': new FormControl(null, [Validators.required, Validators.minLength(6)])
      })

      this.cartDetails = this.sessionService.getCartSession() as CartDetail[];
          this.cartService.setLength(this.cartDetails.length);
          if (this.cartDetails.length == 0) {
            this.router.navigate(['/']);
            this.toastr.info('Hãy chọn một vài sản phẩm rồi tiến hành thanh toán', 'Hệ thống');
          }
          this.cartDetails.forEach(item => {
            this.amountReal += item.product.price * item.quantity;
            this.amount += item.price;
          })
          this.discount = this.amount - this.amountReal;
  
          this.amountPaypal = (this.amount/22727.5);

    }
    
  }

  checkOut() {
    let email = this.sessionService.getUser();
    
    if(email != null){
      if (this.postForm.valid) {
        Swal.fire({
          title: 'Bạn có muốn đặt đơn hàng này?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Không',
          confirmButtonText: 'Đặt'
        }).then((result) => {

          if(result.value){
            let email = this.sessionService.getUser();
          
          this.cartService.getCart(email).subscribe(data => {
            this.cart = data as Cart;
            this.cart.address = this.postForm.value.number + ', ' + this.ward.name + ', ' + this.district.name + ', ' + this.province.name;
            console.log("so dien thoai la:"+ this.postForm.value.phone);
            this.cart.phone = this.postForm.value.phone;

            this.cartService.updateCart(email, this.cart).subscribe(data => {
              this.cart = data as Cart;
              this.orderService.postCartWithUserLogin(email, this.cart).subscribe(data => {
                
                let order:Order = data as Order;
                this.sendMessage(order.ordersId);
                Swal.fire(
                  'Thành công!',
                  'Chúc mừng bạn đã đặt hàng thành công.',
                  'success'
                )
                this.router.navigate(['/cart']);
              }, error => {
                this.toastr.error('Lỗi server', 'Hệ thống');
              })
            }, error => {
              this.toastr.error('Lỗi server', 'Hệ thống');
            })
          }, error => {
            this.toastr.error('Lỗi server', 'Hệ thống');
          })
          }
          
        })
  
      } else {
        this.toastr.error('Hãy nhập đầy đủ thông tin', 'Hệ thống');
      }

    }else {
      console.log("vao cai ko co email");
      if (this.postForm.invalid) {
        console.log("vao cai invalid");
        this.toastr.error('Hãy nhập đầy đủ thông tin!', 'Hệ thống');
        return;
      }else {
        this.otpcode = localStorage.getItem("otp");
        if (this.postForm.value.otp == this.otpcode && this.postForm.value.otp != null) {
          Swal.fire({
            title: 'Bạn có muốn đặt đơn hàng này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Không',
            confirmButtonText: 'Đặt'
          }).then((result) => {
            if(result.value){
              let email = this.postForm.value.email;
          
            this.cart = new Cart(1);
            
            
            this.cart.address = this.postForm.value.number + ', ' + this.ward.name + ', ' + this.district.name + ', ' + this.province.name;
            this.cart.phone = this.postForm.value.phone;
            this.cart.user = new Customer(1,this.postForm.value.name);
            this.cartDetails = this.sessionService.getCartSession();

            console.log("so luong cart details la"+ this.cartDetails.length);

            this.orderRequest = new OrderRequestGuess(this.cart, this.cartDetails);
            
            this.orderService.post(email, this.orderRequest).subscribe(data => {
              
              let order:Order = data as Order;
              this.sendMessage(order.ordersId);
              Swal.fire(
                'Thành công!',
                'Chúc mừng bạn đã đặt hàng thành công.',
                'success'
              )
              this.sessionService.clearCartSession();
              this.cartService.setLength(0);
              this.router.navigate(['/cart']);
            }, error => {
              this.toastr.error('Lỗi server', 'Hệ thống');
            })
            }
            
          })
          window.localStorage.removeItem("otp");
    
          
        }
        else {
          this.toastr.error('Mã OTP không chính xác!', 'Hệ thống');
        }
      }
    }
    
  }

  sendMessage(id:number) {
    let email = this.sessionService.getUser();
    let chatMessage : any;
    if(email != null){
      chatMessage = new ChatMessage(this.cart.user.name, 'đã đặt một đơn hàng');
      this.notificationService.post(new Notification(0, this.cart.user.name + ' đã đặt một đơn hàng ('+id+')')).subscribe(data => {
        this.webSocketService.sendMessage(chatMessage);
      })
    }else {
      chatMessage = new ChatMessage(this.postForm.value.name, ' đã đặt một đơn hàng');
    this.notificationService.post(new Notification(0, this.postForm.value.name + ' đã đặt một đơn hàng ('+id+')')).subscribe(data => {
      this.webSocketService.sendMessage(chatMessage);
    })
    }
     
  }

  getProvinces() {
    this.location.getAllProvinces().subscribe(data => {
      this.provinces = data as Province[];
    })
  }

  getDistricts() {
    this.location.getDistricts(this.provinceCode).subscribe(data => {
      this.province = data as Province;
      this.districts = this.province.districts;
    })
  }

  getWards() {
    this.location.getWards(this.districtCode).subscribe(data => {
      this.district = data as District;
      this.wards = this.district.wards;
    })
  }

  getWard() {
    this.location.getWard(this.wardCode).subscribe(data => {
      this.ward = data as Ward;
    })
  }

  setProvinceCode(code: any) {
    this.provinceCode = code.value;
    this.getDistricts();
  }

  setDistrictCode(code: any) {
    this.districtCode = code.value;
    this.getWards();
  }

  setWardCode(code: any) {
    this.wardCode = code.value;
    this.getWard();
  }

  private checkOutPaypal(): void {

    this.payPalConfig = {
        currency: 'USD',
        clientId: 'Af5ZEdGAlk3_OOp29nWn8_g717UNbdcbpiPIZOZgSH4Gdneqm_y_KVFiHgrIsKM0a2dhNBfFK8TIuoOG',
        createOrderOnClient: (data) => < ICreateOrderRequest > {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value:String(this.amountPaypal.toFixed(2)),

                },

            }]
        },
        advanced: {
            commit: 'true'
        },
        style: {
            label: 'paypal',
            layout: 'vertical',
            color: 'blue',
            size: 'small',
            shape: 'rect',
        },
        onApprove: (data, actions) => {
            console.log('onApprove - transaction was approved, but not authorized', data, actions);
            actions.order.get().then((details: any) => {
                console.log('onApprove - you can get full order details inside onApprove: ', details);
            });

        },
        onClientAuthorization: (data) => {
            console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
            this.checkOut();
        },
        onCancel: (data, actions) => {
            console.log('OnCancel', data, actions);

        },
        onError: err => {
            console.log('OnError', err);
        },
        onClick: (data, actions) => {
            console.log('onClick', data, actions);

        },
    };
}

sendError() {
  this.toastr.warning('Hãy nhập đúng email !', 'Hệ thống');
}

}
