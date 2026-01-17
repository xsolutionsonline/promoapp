import { Component, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { HomeModelPage } from '../home-model/home-model.page';
import { ModalController, Events, IonSlides, NavController, ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
// import { Http } from '@angular/http';
// import { Observable } from 'rxjs/Observable';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // @ViewChild(IonSlides, { static: true }) autoSlides: IonSlides;
  @ViewChild('slideIntro', { static: false }) slideIntro: IonSlides;
  @ViewChild('slideFeatured', { static: false }) slideFeatured: IonSlides;
  @ViewChild('slideCollection', { static: false }) slideCollection: IonSlides;
  @ViewChild('slideSale', { static: false }) slideSale: IonSlides;
  public sliderCount = -1;
  public visiablePopup = false;
  public divBlur = ""
  public slides = [];
  public categoryItems = [];
  public featuredItems = [
    { img: "assets/images/shoes/featured/1.png", text: "NIKE Sports Sneakers for Men", heartVis: false, dPrice: "100", price: "90", featured: true, new: true, sale: true },
    { img: "assets/images/shoes/featured/2.png", text: "Product Title Will Be Go Here! Product Title", heartVis: false, dPrice: "100", price: "90", featured: true, new: false, sale: false },
    { img: "assets/images/shoes/featured/3.png", text: "Product Title Will Be Go Here! Product Title", heartVis: false, dPrice: "100", price: "90", featured: true, new: false, sale: false },
  ];
  public newItems = [
    { img: "assets/images/shoes/new/1.png", text: "Brown Leather Casual Shoes for Men", heartVis: false, dPrice: "190", price: "100", featured: false, new: true, sale: false },
    { img: "assets/images/shoes/new/2.png", text: "Product Title Will Be Go Here! Product Title", heartVis: false, dPrice: "190", price: "100", featured: false, new: true, sale: false },
    { img: "assets/images/shoes/new/3.png", text: "Product Title Will Be Go Here! Product Title", heartVis: false, dPrice: "190", price: "100", featured: false, new: true, sale: true },
  ];
  public saleItems = [
    { img: "assets/images/shoes/sale/1.png", text: "Stitched Business Shoes for Men", heartVis: false, dPrice: "300", price: "200", featured: true, new: true, sale: true },
    { img: "assets/images/shoes/sale/2.png", text: "Product Title Will Be Go Here! Product Title", heartVis: false, dPrice: "190", price: "100", featured: true, new: false, sale: true },
    { img: "assets/images/shoes/sale/3.png", text: "Product Title Will Be Go Here! Product Title", heartVis: false, dPrice: "190", price: "100", featured: true, new: false, sale: true },
  ];
  sliderConfig = {
    slidesPerView: 1.12,
    spaceBetween: 0,
    // pagination: {
    // el:'.swiper-pagination',
    // clickable: true,
    // }
  };
  constructor(private elementRef: ElementRef,
    private modalCtrl: ModalController,
    public events: Events,
    private iab: InAppBrowser,
    private navCtrl: NavController,
    private toastController: ToastController,
    // private http: Http
  ) {
    // let obs= obs.create
    this.events.publish('tabActive', true);
    setTimeout(() => {
      this.slides = [
        "assets/images/banner/banner-1.png",
        "assets/images/banner/banner-2.png",
        "assets/images/banner/banner-3.png",
      ];
      this.categoryItems = [
        { img: "assets/images/category/1.jpg", text: "Dress Shoes" },
        { img: "assets/images/category/2.jpg", text: "Casual Shoes" },
        { img: "assets/images/category/3.jpg", text: "Sports Shoes" },
      ];
    }, 100);
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }
  async heart(item) {
    if (item.heartVis == true) {
      item.heartVis = false;
      //toast controller
      const toast = await this.toastController.create({
        message: 'Product Remove To Wishlist',
        duration: 2000
      });
      toast.present();
    }
    else {
      item.heartVis = true;
      //toast controller
      const toast = await this.toastController.create({
        message: 'Product Added To Wishlist',
        duration: 1000
      });
      toast.present();
    }
  }
  ionViewDidEnter() {
    this.slideIntro.startAutoplay();
  }
  async subscribeAlert() {
    this.divBlur = "blur(6px)"
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    this.visiablePopup = true;//for blue effect
    // for home NgModel
    let modal = await this.modalCtrl.create({
      component: HomeModelPage,
      cssClass: "home-modal",
      componentProps: {
        'hideGuestLogin': true
      }
    });
    return await modal.present();
    //value of blur from home modal
  }
  ionViewWillEnter() {
    //value of blur from home modal
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
    });
    this.visiablePopup = false;//for blur effect
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
  }
  ngOnIt() {
    //value of blue from home modal
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
    });
  }
  slideChanged() {
    this.slideFeatured.getActiveIndex().then(index => {
      if (index == 2) {
        this.slideFeatured.lockSwipeToNext(true);
      }
      else {
        this.slideFeatured.lockSwipeToNext(false);
      }
    });
    this.slideCollection.getActiveIndex().then(index => {
      if (index == 2) {
        this.slideCollection.lockSwipeToNext(true);
      }
      else {
        this.slideCollection.lockSwipeToNext(false);
      }
    });
    this.slideSale.getActiveIndex().then(index => {
      if (index == 2) {
        this.slideSale.lockSwipeToNext(true);
      }
      else {
        this.slideSale.lockSwipeToNext(false);
      }
    });
  }
  goToFb() {
    const browser = this.iab.create('https://www.facebook.com/');
  }
  goToInsta() {
    const browser = this.iab.create('https://www.instagram.com/');
  }
  goToLin() {
    const browser = this.iab.create('https://www.linkedin.com/');
  }
  goToShop(i) {
    if (i == 0) {
      this.events.publish('CatId', "formal");
      console.log(i);
    }
    else if (i == 1) {
      this.events.publish('CatId', "causal");
      console.log(i);
    }
    else if (i == 2) {
      this.events.publish('CatId', "sport");
      console.log(i);
    }
    this.navCtrl.navigateForward("category-detail");
  }
}