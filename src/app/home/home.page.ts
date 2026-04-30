import { Component, ViewEncapsulation, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { HomeModelPage } from '../home-model/home-model.page';
import { ModalController, NavController, ToastController, IonicModule } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Events } from '../services/events.service';
import { DataService } from '../services/data.service';
import { Router, NavigationExtras, RouterLink } from '@angular/router';
import { Firestore, collection, query, where, collectionData, doc, updateDoc, orderBy, getDocs } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
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
  public cartItemCount = 0;

  @ViewChildren('scrollContainer') scrollContainers: QueryList<ElementRef>;
  private autoScrollInterval: any;

  private auth = inject(Auth);
  private userUID: string | null = null;

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
    this.loadData();
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userUID = user.uid;
      } else {
        this.userUID = null;
      }
      this.updateOrderQuantity();
    });
  }

  loadData() {
    this.slides = this.dataService.getSlides();

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

  async updateOrderQuantity() {
    if (!this.userUID) {
      this.cartItemCount = 0;
      return;
    }

    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userUid', '==', this.userUID), where('status', '==', 'pending'));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      this.cartItemCount = 0;
      return;
    }

    let totalQuantity = 0;
    querySnapshot.forEach(orderDoc => {
      const orderData = orderDoc.data();
      if (orderData && orderData['products']) {
        orderData['products'].forEach(product => {
          if (product.variants && product.variants.length > 0) {
            totalQuantity += product.variants.reduce((acc, variant) => acc + (variant.quantity || 0), 0);
          } else {
            totalQuantity += product.quantity || 0;
          }
        });
      }
    });

    this.cartItemCount = totalQuantity;
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

          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
             container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
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

    if (item.id) {
      const productDocRef = doc(this.firestore, `products/${item.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: newHeartVis });
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
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
      const toast = await this.toastController.create({
        message: 'Product Added To Wishlist',
        duration: 1000
      });
      toast.present();
    } else {
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
    this.visiablePopup = true;
    let modal = await this.modalCtrl.create({
      component: HomeModelPage,
      cssClass: "home-modal",
      componentProps: {
        'hideGuestLogin': true
      }
    });
    return await modal.present();
  }

  ionViewWillEnter() {
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
    });
    this.visiablePopup = false;
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    this.startAutoScroll();
    this.updateOrderQuantity();
  }

  ionViewWillLeave() {
    this.stopAutoScroll();
  }

  ngOnIt() {
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
