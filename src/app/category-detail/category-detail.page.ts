import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { ModalController, Events, ToastController, NavController } from '@ionic/angular';
import { ProductColorPage } from '../product-color/product-color.page';
import { ProductPricePage } from '../product-price/product-price.page';
import { ProductSizePage } from '../product-size/product-size.page';
import { ProductSortPage } from '../product-sort/product-sort.page';
import { from } from 'rxjs';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-category-detail',
  templateUrl: './category-detail.page.html',
  styleUrls: ['./category-detail.page.scss'],
})
export class CategoryDetailPage implements OnInit {
  // for enabling and disabling grid and list buttons
  public visiablegridBgList = true;
  public visiableListBgGrid = true;
  // for showing grid or list content
  public visiableGrid = true;
  public visiablePopup = false;
  public divBlur = "";
  //for active, deactive sort
  public sortActive = false;
  //for active, deactive price
  public priceActive = false;
  //for active, deactive color
  public colorActive = false;
  //for active, deactive size
  public sizeActive = false;
  // for category id get from home page
  public categoryId = "";
  //for category 
  public categoryHeader = "Formal Shoes";
  public categoryLoop = [
    { image: "assets/images/shoes/formal/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: false },
    { image: "assets/images/shoes/featured/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: true },
    { image: "assets/images/shoes/sale/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: false },
    { image: "assets/images/shoes/formal/2.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: false },
    { image: "assets/images/shoes/formal/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: true },
    { image: "assets/images/shoes/formal/4.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: true },
    { image: "assets/images/shoes/formal/5.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: true },
    { image: "assets/images/shoes/formal/6.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: false },
  ];
  //for swiper slider
  sliderConfig = {
    slidesPerView: 3.5,
    spaceBetween: 0,
    // pagination: {
    // el:'.swiper-pagination',
    // clickable: true,
    // }
  };
  public sportProducts = [];
  constructor(private modalCtrl: ModalController,
    private elementRef: ElementRef,
    private events: Events,
    private toastController: ToastController,
    private navCtrl: NavController) {

    //for making background blur
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }

  ngOnInit() {
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
        duration: 2000
      });
      toast.present();
    }
  }
  // for list and grid
  isGridList(item) {
    if (item == 'gridBg') {
      this.visiablegridBgList = true;
      this.visiableListBgGrid = true;
      console.log("gridBg");
    }
    else if (item == 'grid') {
      this.visiablegridBgList = true;
      this.visiableListBgGrid = true;
      // for enabling grid
      this.visiableGrid = true;
      console.log("grid");
    }
    else if (item == 'listBg') {
      this.visiablegridBgList = false;
      this.visiableListBgGrid = false;
      console.log("listBg");
    }
    else if (item == 'list') {
      this.visiablegridBgList = false;
      this.visiableListBgGrid = false;
      // for enabling list
      this.visiableGrid = false;
      console.log("list");
    }
  }
  async sort(i) {
    if (i == 0) {
      this.sortActive = true;
      this.divBlur = "blur(6px)"
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      // for home NgModel
      let modal = await this.modalCtrl.create({
        component: ProductSortPage,
        cssClass: "home-modal",
        componentProps: {
          'hideGuestLogin': true
        }
      });
      return await modal.present()
    }
    else if (i == 1) {
      this.sortActive = false;
    }
  }
  async price(i) {
    if (i == 0) {
      this.priceActive = true;
      this.divBlur = "blur(6px)"
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      // for home NgModel
      let modal = await this.modalCtrl.create({
        component: ProductPricePage,
        cssClass: "product-price-modal",
        componentProps: {
          'hideGuestLogin': true
        }
      });
      return await modal.present();
    }
    else if (i == 1) {
      this.priceActive = false;
    }
  }
  async color(i) {
    if (i == 0) {
      this.colorActive = true;
      this.divBlur = "blur(6px)"
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      // for home NgModel
      let modal = await this.modalCtrl.create({
        component: ProductColorPage,
        cssClass: "home-modal",
        componentProps: {
          'hideGuestLogin': true
        }
      });
      return await modal.present();
    }
    else if (i == 1) {
      this.colorActive = false;
    }
  }
  async size(i) {
    if (i == 0) {
      this.sizeActive = true;
      this.divBlur = "blur(6px)"
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      // for home NgModel
      let modal = await this.modalCtrl.create({
        component: ProductSizePage,
        cssClass: "home-modal",
        componentProps: {
          'hideGuestLogin': true
        }
      });
      return await modal.present();
    }
    else if (i == 1) {
      this.sizeActive = false;
    }
  }
  ionViewWillEnter() {
    // value of category
    // setTimeout(() => {
    this.events.subscribe('CatId', (data) => {
      this.categoryId = data;
      console.log("category value: " + this.categoryId);
    });
    // console.log("outer view will enter" + this.categoryId);
    if (this.categoryId == "formal") {
      console.log("outer view will enter" + this.categoryId);
      this.categoryHeader = "Formal Shoes";
      this.categoryLoop = [
        { image: "assets/images/shoes/formal/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: false },
        { image: "assets/images/shoes/featured/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: true },
        { image: "assets/images/shoes/sale/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: false },
        { image: "assets/images/shoes/formal/2.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: false },
        { image: "assets/images/shoes/formal/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: true },
        { image: "assets/images/shoes/formal/4.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: true },
        { image: "assets/images/shoes/formal/5.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: true },
        { image: "assets/images/shoes/formal/6.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: false },
      ];
    }
    else if (this.categoryId == "causal") {
      console.log("outer view will enter" + this.categoryId);
      this.categoryHeader = "Casual Shoes";
      this.categoryLoop = [
        { image: "assets/images/shoes/new/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: false },
        { image: "assets/images/shoes/new/2.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: true },
        { image: "assets/images/shoes/casual/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: false },
        { image: "assets/images/shoes/casual/2.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: false },
        { image: "assets/images/shoes/casual/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: true },
        { image: "assets/images/shoes/casual/4.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: true },
        { image: "assets/images/shoes/casual/5.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: true },
        { image: "assets/images/shoes/sale/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: false },
      ];
    }
    else if (this.categoryId == "sport") {
      console.log("outer view will enter" + this.categoryId);
      this.categoryHeader = "Sport Shoes";
      this.categoryLoop = [
        { image: "assets/images/shoes/featured/2.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: false },
        { image: "assets/images/shoes/featured/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: true },
        { image: "assets/images/shoes/sale/2.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: false },
        { image: "assets/images/shoes/sport/4.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: false },
        { image: "assets/images/shoes/sport/1.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: false, sale: true },
        { image: "assets/images/shoes/sport/2.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: true, sale: true },
        { image: "assets/images/shoes/sport/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: true, new: true, sale: true },
        { image: "assets/images/shoes/new/3.png", textGrid: "Product Name Will Go Here!", textList: "Product Name Will Go Here! Product Title", price: "100", dPrice: "150", heartVis: false, featured: false, new: false, sale: false },
      ];
    }
    // }, 100);
  }
  goToProductDetail() {
    this.navCtrl.navigateForward("product-detail");
  }
}