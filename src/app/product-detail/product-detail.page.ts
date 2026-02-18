import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, ToastController, NavController } from '@ionic/angular';
//product detail modal
import { ProductDetailModalPage } from '../product-detail-modal/product-detail-modal.page'
import { Events } from '../services/events.service';
import { Router } from '@angular/router';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: false,
})
export class ProductDetailPage implements OnInit, OnDestroy {
  @ViewChild('productSlider', { static: false }) productSlider: ElementRef;

  public visProductSuccessful = true;
  productQuantity = 1;
  productPrice = 90;
  productDPrice = 100; // Added for discount price

  //for blur effect
  public visiablePopup = false;
  public divBlur = ""
  // for heart
  public visHeart = true;
  public categoryHeader = "Product Name Here";
  public slides = [
    "assets/images/product-detail/1.png",
    "assets/images/product-detail/2.png",
    "assets/images/product-detail/3.png",
  ];
  public productSlides = [
    { img: "assets/images/shoes/featured/1.png", name: "Product Name Will Go Here!", price: "100", dPrice: "150", feature: true, new: false, sale: false, heartVis: false },
    { img: "assets/images/shoes/sport/2.png", name: "Product Name Will Go Here!", price: "100", dPrice: "150", feature: false, new: true, sale: false, heartVis: false },
    { img: "assets/images/shoes/sale/2.png", name: "Product Name Will Go Here!", price: "100", dPrice: "150", feature: false, new: false, sale: true, heartVis: false }
  ];
  public colorItems = [];
  public sizeItems = [];
  sliderConfig = {
    slidesPerView: 2.1,
    spaceBetween: 5,
    // pagination: {
    // el:'.swiper-pagination',
    // clickable: true,
    // }
  };

  // Variable to hold the current product data
  currentProduct: any = null;

  // Autoplay interval
  private autoplayInterval: any;

  constructor(private modalCtrl: ModalController,
    public events: Events, private elementRef: ElementRef,
    private toastController: ToastController,
    private navCtrl: NavController,
    private router: Router) {

    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }

  ngOnInit() {
    // Logic moved to ionViewWillEnter to handle cached views
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  initializeProductData(data: any) {
    if (data) {
      this.currentProduct = data;
      // Use title if available, otherwise fallback to text
      this.categoryHeader = data.title ? data.title : data.text;
      this.productPrice = parseFloat(data.price);
      this.productDPrice = parseFloat(data.dPrice);
      this.visHeart = !data.heartVis;

      // Update slides with the product images
      if (data.imgSlides && data.imgSlides.length > 0) {
        this.slides = data.imgSlides;
      } else if (data.img) {
        // Fallback if imgSlides is missing but img exists
        this.slides = [
          data.img,
          data.img,
          data.img
        ];
      }

      // Update similar products
      if (data.similarItems) {
        this.productSlides = data.similarItems;
      }

      // Initialize variants (colors and sizes) from product data
      if (data.variants) {
        this.colorItems = data.variants[0].colors || [];
        this.sizeItems = data.variants[0].sizes || [];
      } else {
        // Fallback or empty if no variants
        this.colorItems = [];
        this.sizeItems = [];
      }

      // Reset quantity
      this.productQuantity = 1;
    }
  }

  ionViewDidLeave() {
    console.log("Leaving Product Detail - Resetting Data");
    this.stopAutoplay();
    this.currentProduct = null;
    this.categoryHeader = "Product Name Here";
    this.productPrice = 90;
    this.productDPrice = 100;
    this.visHeart = true;
    this.productQuantity = 1;
    this.slides = [
      "assets/images/product-detail/1.png",
      "assets/images/product-detail/2.png",
      "assets/images/product-detail/3.png",
    ];
    this.colorItems = [];
    this.sizeItems = [];
    // Reset similar products to default if needed, or keep the last ones until new ones load
    // this.productSlides = ...
  }

  startAutoplay() {
    this.stopAutoplay(); // Clear existing interval if any

    this.autoplayInterval = setInterval(() => {
      if (this.productSlider && this.productSlider.nativeElement) {
        const container = this.productSlider.nativeElement;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScrollLeft = scrollWidth - clientWidth;

        // Calculate next scroll position (scroll one item width roughly)
        // Assuming item width is roughly clientWidth (full width slide)
        let nextScrollLeft = container.scrollLeft + clientWidth;

        if (nextScrollLeft >= maxScrollLeft + 10) { // +10 buffer
          // Reset to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
        }
      }
    }, 10000); // 10 seconds
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  async share() {
    //toast controller
    const toast = await this.toastController.create({
      message: 'Product Share Clicked',
      duration: 2000
    });
    toast.present();
  }
  heart() {
    this.visHeart = !this.visHeart;
  }
  heartProduct(item) {
    if (item.heartVis == true) {
      item.heartVis = false;
    }
    else {
      item.heartVis = true;
    }
  }
  ionViewWillEnter() {
    // Check for data in history.state (Router State)
    // This runs every time the view enters, ensuring data is loaded even if cached
    if (history.state && history.state.product) {
      const data = history.state.product;
      console.log("Product received via history.state in ionViewWillEnter:", data);
      this.initializeProductData(data);
    }

    //value of blue from home modal
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
    });
    this.visiablePopup = false;//for blur effect
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);

    // Start autoplay when entering the view
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.startAutoplay();
    }, 1000);

    // Keep the event subscription as a fallback or if you use it elsewhere
    this.events.subscribe('product_detail', (data) => {
       // console.log("Product received via Event:", data);
       // this.initializeProductData(data);
    });
  }
  goToProductDetailModal() {
    this.divBlur = "blur(6px)"
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    this.visiablePopup = true;//for blur effect
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;//for disable blur effect
    this.divBlur = "blur(0px)"
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
  }
  //for color
  isColorCheck(item) {
    // Deselect all other colors
    this.colorItems.forEach(c => c.selectSize = false);
    item.selectSize = true;
  }
  isSelectedColorCheck(item) {
    item.selectSize = false;
  }
  //for size
  isSizeCheck(item) {
    // Deselect all other sizes
    this.sizeItems.forEach(s => s.selectSize = false);
    item.selectSize = true;
  }
  isSelectSizeCheck(item) {
    item.selectSize = false;
  }
  addBtn() {
    this.productQuantity = this.productQuantity + 1;
    const unitPrice = this.currentProduct ? parseFloat(this.currentProduct.price) : 45; // Default 45 if no product
    this.productPrice = unitPrice * this.productQuantity;
  }
  subBtn() {
    this.productQuantity = this.productQuantity - 1;
    if (this.productQuantity < 1) {
      this.productQuantity = 1;
    }
    const unitPrice = this.currentProduct ? parseFloat(this.currentProduct.price) : 45;
    this.productPrice = unitPrice * this.productQuantity;
  }
  goToReview() {
    this.navCtrl.navigateForward("review");
  }
  goToproductSucessfull() {
    this.visProductSuccessful = false;
  }
  goToCart() {
    this.events.publish('blurValue', "blur(0px)");
    this.visProductSuccessful = true;
    this.navCtrl.navigateForward("cart");
  }
  goToHome() {
    this.events.publish('blurValue', "blur(0px)");
    this.visProductSuccessful = true;
    this.navCtrl.navigateForward("home");
  }
}
