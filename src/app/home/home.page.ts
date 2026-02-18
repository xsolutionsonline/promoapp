import { Component, ViewEncapsulation, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { HomeModelPage } from '../home-model/home-model.page';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Events } from '../services/events.service';
import { DataService } from '../services/data.service';
import { Router, NavigationExtras } from '@angular/router';
import { Firestore, collection, query, where, collectionData, doc, updateDoc, orderBy } from '@angular/fire/firestore';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit, OnDestroy {
  public visiablePopup = false;
  public divBlur = ""
  public slides = [];
  public categoryItems = [];
  public featuredItems = [];
  public newItems = [];
  public saleItems = [];
  public isGrid = false; // Default to list view (1 column)

  @ViewChildren('scrollContainer') scrollContainers: QueryList<ElementRef>;
  private autoScrollInterval: any;

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

    // Load categories from Firestore
    const categoriesRef = collection(this.firestore, 'category');
    const categoriesQuery = query(categoriesRef, where('active', '==', true));
    collectionData(categoriesQuery, { idField: 'id' }).subscribe((data: any[]) => {
      this.categoryItems = data.sort((a, b) => (a.order || 0) - (b.order || 0));
    });

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

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  startAutoScroll() {
    this.stopAutoScroll(); // Ensure no duplicate intervals
    this.autoScrollInterval = setInterval(() => {
      if (this.isGrid) return; // Don't scroll in grid view

      if (this.scrollContainers) {
        this.scrollContainers.forEach((containerRef) => {
          const container = containerRef.nativeElement;
          const scrollAmount = container.offsetWidth * 0.85; // Scroll by roughly one item width
          const maxScrollLeft = container.scrollWidth - container.clientWidth;

          // Check if we are close to the end (within a small tolerance)
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
             // If at the end, scroll back to start smoothly
             container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
             // Otherwise scroll forward
             container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        });
      }
    }, 10000); // 10 seconds
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  toggleView() {
    this.isGrid = !this.isGrid;
  }

  async heart(item) {
    const newHeartVis = !item.heartVis;
    item.heartVis = newHeartVis;

    // Update Firestore
    if (item.id) {
      const productDocRef = doc(this.firestore, `products/${item.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: newHeartVis });
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
        // Revert local change if update fails
        item.heartVis = !newHeartVis;
        const toast = await this.toastController.create({
          message: 'Failed to update wishlist status',
          duration: 2000
        });
        toast.present();
        return;
      }
    }

    if (newHeartVis) {
      //toast controller
      const toast = await this.toastController.create({
        message: 'Product Added To Wishlist',
        duration: 1000
      });
      toast.present();
    } else {
      //toast controller
      const toast = await this.toastController.create({
        message: 'Product Remove To Wishlist',
        duration: 2000
      });
      toast.present();
    }
  }

  async buyItem(item) {
    const toast = await this.toastController.create({
      message: 'Product added to cart',
      duration: 1000
    });
    toast.present();
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
    this.startAutoScroll();
  }

  ionViewWillLeave() {
    this.stopAutoScroll();
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
  goToShop(item) {
    debugger;
    const navigationExtras: NavigationExtras = {
      state: {
        category: item
      }
    };
    this.router.navigate(['category-detail'], navigationExtras);
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
