import { Component, ViewEncapsulation, ElementRef } from '@angular/core';
import { HomeModelPage } from '../home-model/home-model.page';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Events } from '../services/events.service';
import { DataService } from '../services/data.service';
import { Router, NavigationExtras } from '@angular/router';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  public visiablePopup = false;
  public divBlur = ""
  public slides = [];
  public categoryItems = [];
  public featuredItems = [];
  public newItems = [];
  public saleItems = [];
  public isGrid = false; // Default to list view (1 column)

  constructor(private elementRef: ElementRef,
    private modalCtrl: ModalController,
    public events: Events,
    private navCtrl: NavController,
    private toastController: ToastController,
    private dataService: DataService,
    private router: Router,
    private firestore: Firestore
  ) {
    this.events.publish('tabActive', true);

    // Load data from service
    this.loadData();

    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }

  loadData() {
    this.slides = this.dataService.getSlides();
    this.categoryItems = this.dataService.getCategoryItems();

    const productsRef = collection(this.firestore, 'products');

    const featuredQuery = query(productsRef, where('featured', '==', true));
    collectionData(featuredQuery, { idField: 'id' }).subscribe((data: any[]) => {
      this.featuredItems = data;
    });

    const newItemsQuery = query(productsRef, where('new', '==', true));
    collectionData(newItemsQuery, { idField: 'id' }).subscribe((data: any[]) => {
      this.newItems = data;
    });

    const saleItemsQuery = query(productsRef, where('sale', '==', true));
    collectionData(saleItemsQuery, { idField: 'id' }).subscribe((data: any[]) => {
      this.saleItems = data;
    });
  }

  toggleView() {
    this.isGrid = !this.isGrid;
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

  async goToFb() {
    await Browser.open({ url: 'https://www.facebook.com/' });
  }
  async goToInsta() {
    await Browser.open({ url: 'https://www.instagram.com/' });
  }
  async goToLin() {
    await Browser.open({ url: 'https://www.linkedin.com/' });
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

  goToProductDetail(item) {
    const navigationExtras: NavigationExtras = {
      state: {
        product: item
      }
    };
    this.router.navigate(['product-detail'], navigationExtras);
  }
}
