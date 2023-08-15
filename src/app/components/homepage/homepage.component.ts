import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Favorites } from 'src/app/common/Favorites';
import { Product } from 'src/app/common/Product';
import { Rate } from 'src/app/common/Rate';
import { CartService } from 'src/app/services/cart.service';
import { CustomerService } from 'src/app/services/customer.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { ProductService } from 'src/app/services/product.service';
import { RateService } from 'src/app/services/rate.service';
import { SessionService } from 'src/app/services/session.service';
// import { NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  cartDetails: CartDetail[] = [];
  productSeller!:Product[];
  productLatest!:Product[];
  productRated!:Product[];

  isLoading = true;

  customer!: Customer;
  favorite!: Favorites;
  favorites!: Favorites[];

  cart!: Cart;
  cartDetail!: CartDetail;
  
  
  rates!: Rate[];
  countRate!: number;

  slideConfig = {"slidesToShow": 8, "slidesToScroll": 2, "autoplay": true};

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private customerService: CustomerService,
    private rateService: RateService,
    private toastr: ToastrService,
    private favoriteService: FavoritesService,
    private sessionService: SessionService,
    private router: Router) { 

      
    }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.getAllProductBestSeller();
    this.getAllProductLatest();
    this.getAllProductRated();
    this.getAllRate();
  }

  getAllRate() {
    this.rateService.getAll().subscribe(data => {
      this.rates = data as Rate[];
    })
  }

  getAvgRate(id: number): number {
    let avgRating: number = 0;
    this.countRate = 0;
    for (const item of this.rates) {
      if (item.product.productId === id) {
        avgRating += item.rating;
        this.countRate++;
      }
    }
    return Math.round(avgRating/this.countRate * 10) / 10;
  }

  getAllProductBestSeller() {
    this.productService.getBestSeller().subscribe(data=>{
      this.productSeller = data as Product[];
      this.isLoading = false;
    }, error=>{
      this.toastr.error('Lỗi server!', 'Hệ thống')   
      console.log(error);   
    })
  }

  getAllProductLatest() {
    this.productService.getLasted().subscribe(data=>{
      this.productLatest = data as Product[];
      this.isLoading = false;
    }, error=>{
      this.toastr.error('Lỗi server!', 'Hệ thống')  
      console.log(error);    
    })
  }

  getAllProductRated() {
    this.productService.getRated().subscribe(data=>{
      this.productRated = data as Product[];
      this.isLoading = false;
    }, error=>{
      this.toastr.error('Lỗi server!', 'Hệ thống')   
      console.log(error);
         
    })
  }

  toggleLike(id: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Hãy đăng nhập để sử dụng dịch vụ của chúng tôi', 'Hệ thống');
      return;
    }
    this.favoriteService.getByProductIdAndEmail(id, email).subscribe(data => {      
      if (data == null) {
        this.customerService.getByEmail(email).subscribe(data => {
          this.customer = data as Customer;
          this.favoriteService.post(new Favorites(0, new Customer(this.customer.userId,this.customer.name), new Product(id))).subscribe(data => {
            this.toastr.success('Thêm thành công!', 'Hệ thống');
            this.favoriteService.getByEmail(email).subscribe(data=>{
              this.favorites = data as Favorites[];
              this.favoriteService.setLength(this.favorites.length);
            }, error=>{
              this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
            })
          }, error => {
            this.toastr.error('Thêm thất bại!', 'Hệ thống');
          })
        })
      } else {
        this.favorite = data as Favorites;
        this.favoriteService.delete(this.favorite.favoriteId).subscribe(data => {
          this.toastr.info('Đã xoá ra khỏi danh sách yêu thích!', 'Hệ thống');
          this.favoriteService.getByEmail(email).subscribe(data=>{
            this.favorites = data as Favorites[];
            this.favoriteService.setLength(this.favorites.length);
          }, error=>{
            this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
          })
        }, error => {
          this.toastr.error('Lỗi!', 'Hệ thống');
        })
      }
    })
  }

 

  getExistingCartDetailByProductId(productId: number): CartDetail | any {
    let listCartDetails = this.sessionService.getCartSession();
    if(listCartDetails != null){
      this.cartDetails = listCartDetails as CartDetail[];
      for( let i = 0; i < this.cartDetails.length; i++){
        if(this.cartDetails[i].product.productId == productId) return this.cartDetails[i];
      }
    }
    
    return null;
  }

  addCart(productId: number, price: number) {
    let email = this.sessionService.getUser();
    let listCartDetails = this.sessionService.getCartSession();

    if (email == null) {
      
      if(listCartDetails != null) {
      this.cartDetails = listCartDetails as CartDetail[];
     
      }
    
    
    let existingCartDetail = this.getExistingCartDetailByProductId(productId) as CartDetail;
    if (existingCartDetail) {
      
      existingCartDetail.quantity +=1;
      this.sessionService.saveCartSession(this.cartDetails);
      
    } else {
      let product = null;
      // Thêm sản phẩm vào giỏ hàng nếu chưa tồn tại
      this.productService.getOne(productId).subscribe(data => {
        
        product = data as Product;
        if(listCartDetails == null) {
          this.cartDetail = new CartDetail(1, 1, price, product, new Cart(1));
        }
        this.cartDetail = new CartDetail(this.cartDetails.length + 1, 1, price, product, new Cart(1));
        this.cartDetails.push(this.cartDetail);
        this.sessionService.saveCartSession(this.cartDetails);
        this.cartService.setLength(this.cartDetails.length);
      })
      
      
      
      
    }
    
      
      
    this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
      
      
    }
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      this.cartDetail = new CartDetail(0, 1, price, new Product(productId), new Cart(this.cart.cartId));
      this.cartService.postDetail(this.cartDetail).subscribe(data => {
        this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
        this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
          this.cartDetails = data as CartDetail[];
          console.log("tong so item la:" + this.cartDetails.length);
          this.cartService.setLength(this.cartDetails.length);
        })
      }, error => {
        this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
        this.router.navigate(['/home']);
        window.location.href = "/";
      })
    })
  }

}
