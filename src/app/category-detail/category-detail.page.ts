import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { ModalController, ToastController, NavController } from '@ionic/angular';
import { ProductColorPage } from '../product-color/product-color.page';
import { ProductPricePage } from '../product-price/product-price.page';
import { ProductSizePage } from '../product-size/product-size.page';
import { ProductSortPage } from '../product-sort/product-sort.page';
import { Events } from '../services/events.service';
import { NavigationExtras, Router, ActivatedRoute } from "@angular/router";
import { DataService } from '../services/data.service';
import { Firestore, collection, query, where, collectionData, doc, getDoc } from '@angular/fire/firestore';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-category-detail',
  templateUrl: './category-detail.page.html',
  styleUrls: ['./category-detail.page.scss'],
  standalone: false,
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
  public categoryHeader = "Category";
  public categoryLoop = [];
  //for swiper slider
  sliderConfig = {
    slidesPerView: 3.5,
    spaceBetween: 0,
  };
  public sportProducts = [];
  constructor(private modalCtrl: ModalController,
    private elementRef: ElementRef,
    private events: Events,
    private toastController: ToastController,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private firestore: Firestore) {

    //for making background blur
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });

    this.route.queryParams.subscribe(params => {

      if (this.router.getCurrentNavigation().extras.state) {
        const category = this.router.getCurrentNavigation().extras.state["category"];
        if (category) {
          this.categoryId = category.id;
          this.categoryHeader = category.text;
          this.loadProducts();
        }
      }
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
        cssClass: "product-color-modal",
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
        component: ProductColorPage,
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

  loadProducts() {

    if (this.categoryHeader) {
      const productsRef = collection(this.firestore, 'products');
      const q = query(productsRef, where('category.name', '==', this.categoryHeader));

      collectionData(q, { idField: 'id' }).subscribe((products: any[]) => {
          this.categoryLoop = products;
      });
    }
  }

  ionViewWillEnter() {

    // Keep existing event subscription as fallback or for other navigation methods
    this.events.subscribe('CatId', async (data) => {
      this.categoryId = data;
      console.log("category value: " + this.categoryId);

      if (this.categoryId) {
        // 1. Get Category Name from Firestore
        const categoryDocRef = doc(this.firestore, `category/${this.categoryId}`);
        const categorySnapshot = await getDoc(categoryDocRef);

        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          this.categoryHeader = categoryData['text']; // Assuming 'text' is the field name for category name
          this.loadProducts();

        } else {
          console.log("No such category!");
          this.categoryHeader = "Category Not Found";
          this.categoryLoop = [];
        }
      }
    });
  }
  goToProductDetail(item) {
    // If item is passed from the template click event
    if (item) {
        const navigationExtras: NavigationExtras = {
        state: {
            product: item
        }
        };
        this.router.navigate(['product-detail'], navigationExtras);
    } else {
        // Fallback if called without item (e.g. from existing HTML that might not pass it yet)
        // Ideally, update HTML to pass 'product'
        console.warn("No item passed to goToProductDetail");
    }
  }
}
