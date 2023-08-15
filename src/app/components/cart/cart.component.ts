import { Category } from './../../common/Category';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { CartService } from 'src/app/services/cart.service';
import { SessionService } from 'src/app/services/session.service';
import { Product } from 'src/app/common/Product';
import { ProductService } from 'src/app/services/product.service';



@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  discount!:number;
  amount!:number;
  amountReal!:number;

  Product!: Product;
  checkQuantityProduct: boolean = true;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    private sessionService: SessionService,
    private productService: ProductService) {
    
   }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.discount=0;
    this.amount=0;
    this.amountReal=0;
    this.getAllItem();
  }

  getAllItem() {
    let email = this.sessionService.getUser();
    
    if(email != null){
      this.cartService.getCart(email).subscribe(data => {
        this.cart = data as Cart;
        this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
          console.log("data la"+ data);
          this.cartDetails = data as CartDetail[];

          
          
          this.cartService.setLength(this.cartDetails.length);
          this.cartDetails.forEach(item=>{
            console.log("Price: "+ item.price);
            this.amountReal += item.product.price * item.quantity;
            this.amount += item.price;
            
          })
          this.discount = this.amount - this.amountReal;
        })
      })
    }else {

      let listCartDetails = this.sessionService.getCartSession();
      
      if(listCartDetails != null) {
        this.cartDetails = listCartDetails as CartDetail[];
        
        
          this.cartService.setLength(this.cartDetails.length);
          this.cartDetails.forEach(item=>{
            item.price = item.price * item.quantity;
            this.amountReal += item.product.price * item.quantity;
            this.amount += item.price;
            console.log("amountReal : "+ item.product.price);
            console.log("quantity: "+ item.quantity);
          })
          this.discount = this.amount - this.amountReal;
      }

    }

    
  }

  getExistingCartDetailById(id: number): CartDetail | any {
    let listCartDetails = this.sessionService.getCartSession();
    if(listCartDetails != null){
      this.cartDetails = listCartDetails as CartDetail[];
      for( let i = 0; i < this.cartDetails.length; i++){
        if(this.cartDetails[i].cartDetailId == id) return this.cartDetails[i];
      }
    }
    
    return null;
  }

  getIndexCartDetailById(id: number): number {
    let listCartDetails = this.sessionService.getCartSession();
    if(listCartDetails != null){
      this.cartDetails = listCartDetails as CartDetail[];
      for( let i = 0; i < this.cartDetails.length; i++){
        if(this.cartDetails[i].cartDetailId == id) return i;
      }
    }
    
    return -1;
  }

  update(id: number, quantity: number) {
    let email = this.sessionService.getUser();
    if (quantity < 1) {
      this.delete(id);
    } else {

      if(email != null){
        this.cartService.getOneDetail(id).subscribe(data => {
          
          console.log('vao cart service .');
          this.cartDetail = data as CartDetail;

          if(this.cartDetail.product.quantity == quantity){
            this.toastr.info('Số lượng bạn chọn mua đã tối đa trong kho!', 'Hệ thống');
          }
         
          
            
            this.cartDetail.quantity = quantity;
            this.cartDetail.price = (this.cartDetail.product.price * (1 - this.cartDetail.product.discount / 100)) * quantity;
            this.cartService.updateDetail(this.cartDetail).subscribe(data => {
              this.ngOnInit();
            }, error => {
              this.toastr.error('Lỗi!' + error.status, 'Hệ thống');
            })
          

          
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
        })
      }else {
        
          let existingCartDetail = this.getExistingCartDetailById(id) as CartDetail;

          if(existingCartDetail.product.quantity == quantity){
            this.toastr.info('Số lượng bạn chọn mua đã tối đa trong kho!', 'Hệ thống');
          }

          
          
            existingCartDetail.quantity = quantity;
            existingCartDetail.price = (existingCartDetail.product.price * (1 - existingCartDetail.product.discount / 100)) * quantity;
          
            this.sessionService.saveCartSession(this.cartDetails);
            this.ngOnInit();
          
          
          
      }

      
    }
  }

  checkQuantityOfProducrInStore(id : number, quan: number){
      this.productService.getOne(id).subscribe(data => {
        this.Product = data as Product;
        
        if(this.Product.quantity <= quan){
          this.checkQuantityProduct = false ;
        }else {
          this.checkQuantityProduct = true ;
        }
        

      }, error => {
        this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
      }) 


  }

 

  delete(id: number) {
    let email = this.sessionService.getUser();
    Swal.fire({
      title: 'Bạn muốn xoá sản phẩm này ra khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Không',
      confirmButtonText: 'Xoá'
    }).then((result) => {
      if (result.isConfirmed) {
        if(email != null){
          this.cartService.deleteDetail(id).subscribe(data => {
            this.toastr.success('Xoá thành công!', 'Hệ thống');
            this.ngOnInit();
          }, error => {
            this.toastr.error('Xoá thất bại! ' + error.status, 'Hệ thống');
          })
        }else {

          let listCartDetails = this.sessionService.getCartSession();
          let existingCartDetail = this.getExistingCartDetailById(id) as CartDetail;
          console.log("phan tu tim thay:" + existingCartDetail.product.productId);
          if (listCartDetails != null) {
            this.cartDetails = listCartDetails as CartDetail[];
            const index = this.getIndexCartDetailById(id);
            
            if (index > -1) {
              this.cartDetails.splice(index, 1);
              this.sessionService.saveCartSession(this.cartDetails);
            }
            this.toastr.success('Xoá thành công!', 'Hệ thống');
            this.ngOnInit();
          }

              
        }
        
      }
    })
  }

}
