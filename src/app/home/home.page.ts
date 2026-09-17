import { Component, ViewEncapsulation, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { HomeModelPage } from '../home-model/home-model.page';
import { ModalController, NavController, ToastController, IonicModule } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Events } from '../services/events.service';
import { DataService } from '../services/data.service';
import { Router, NavigationExtras } from '@angular/router';
import { Firestore, collection, query, where, collectionData, doc, updateDoc, orderBy } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements AfterViewInit, OnDestroy {
  public visiablePopup = false;
  public divBlur = ""
  public slides = [];
  public categoryItems = [];
  public featuredItems = [];
  public newItems = [];
  public saleItems = [];

  // Raw Firestore results per flag — a product can be featured AND new AND
  // sale at once. rawFeatured/rawNew/rawSale keep the full matches; the
  // section-assignment map then keeps each such product in only one of the
  // three home sections, so it isn't shown three times.
  private rawFeatured: any[] = [];
  private rawNew: any[] = [];
  private rawSale: any[] = [];
  // Each of the 3 Firestore listeners above resolves at its own pace. Until
  // all three have delivered at least once, a product's eligible-sections
  // set is incomplete — assigning it early (e.g. only "new" has loaded so
  // far) would lock it into that section forever, since the later-arriving
  // "sale" match wouldn't invalidate an already-valid assignment.
  private featuredLoaded = false;
  private newLoaded = false;
  private saleLoaded = false;
  // Picked once per product per page load (not re-rolled on Firestore
  // updates like a heart toggle), so it stays put until the next reload.
  private sectionAssignment = new Map<string, 'featured' | 'new' | 'sale'>();

  // Web-only "pago contra entrega" banner popup, shown each time the user
  // enters the home page — but only once assets/videos/splash.mp4 (the splash
  // screen modal) has finished, so it doesn't appear underneath it.
  // Mobile keeps the banner inline instead (see template).
  public isBannerPopupOpen = false;
  private readonly desktopBreakpoint = 900;
  private splashDone = false;
  private homeEntered = false;

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
    this.loadData();
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
    this.events.subscribe('splashVideoEnded', () => {
      this.splashDone = true;
      this.maybeShowBannerPopup();
    });
  }

  private maybeShowBannerPopup() {
    if (this.homeEntered && this.splashDone && window.innerWidth >= this.desktopBreakpoint) {
      this.isBannerPopupOpen = true;
    }
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
      this.rawFeatured = data;
      this.featuredLoaded = true;
      this.recomputeSectionsWhenReady();
    });

    const newItemsQuery = query(productsRef, where('new', '==', true));
    collectionData(newItemsQuery, { idField: 'id' }).subscribe((data: any[]) => {
      this.rawNew = data;
      this.newLoaded = true;
      this.recomputeSectionsWhenReady();
    });

    const saleItemsQuery = query(productsRef, where('sale', '==', true));
    collectionData(saleItemsQuery, { idField: 'id' }).subscribe((data: any[]) => {
      this.rawSale = data;
      this.saleLoaded = true;
      this.recomputeSectionsWhenReady();
    });
  }

  private recomputeSectionsWhenReady(previousAssignment?: Map<string, 'featured' | 'new' | 'sale'>) {
    if (this.featuredLoaded && this.newLoaded && this.saleLoaded) {
      this.recomputeSections(previousAssignment);
    }
  }

  // A product tagged featured+new+sale at once would otherwise be pulled in
  // by all three queries above and shown three times on the home page. This
  // keeps it in exactly one of those sections, picked at random the first
  // time we see it (so it varies on every reload) and then kept stable for
  // the rest of this visit (so a heart-toggle refresh doesn't reshuffle it).
  // `previousAssignment` (passed on ionViewWillEnter re-rolls) is excluded
  // from the random pick when there's more than one option, so a product
  // never lands back in the same section it was in on the last visit.
  private recomputeSections(previousAssignment?: Map<string, 'featured' | 'new' | 'sale'>) {
    const sections: Array<{ key: 'featured' | 'new' | 'sale'; items: any[] }> = [
      { key: 'featured', items: this.rawFeatured },
      { key: 'new', items: this.rawNew },
      { key: 'sale', items: this.rawSale }
    ];

    const eligibleByProductId = new Map<string, Set<'featured' | 'new' | 'sale'>>();
    sections.forEach(({ key, items }) => {
      items.forEach(item => {
        if (!eligibleByProductId.has(item.id)) {
          eligibleByProductId.set(item.id, new Set());
        }
        eligibleByProductId.get(item.id).add(key);
      });
    });

    eligibleByProductId.forEach((eligible, id) => {
      if (!this.sectionAssignment.has(id) || !eligible.has(this.sectionAssignment.get(id))) {
        let options = Array.from(eligible);
        const previousPick = previousAssignment?.get(id);
        if (previousPick && options.length > 1) {
          options = options.filter(option => option !== previousPick);
        }
        const pick = options[Math.floor(Math.random() * options.length)];
        this.sectionAssignment.set(id, pick);
      }
    });

    this.featuredItems = this.rawFeatured.filter(item => this.sectionAssignment.get(item.id) === 'featured');
    this.newItems = this.rawNew.filter(item => this.sectionAssignment.get(item.id) === 'new');
    this.saleItems = this.rawSale.filter(item => this.sectionAssignment.get(item.id) === 'sale');
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
    this.homeEntered = true;
    this.maybeShowBannerPopup();

    // Ionic's RouteReuseStrategy keeps this page instance alive instead of
    // recreating it, so the constructor (and its one-time random section
    // assignment) only ever ran once. Re-rolling here makes multi-tagged
    // products actually rotate section every time you come back to home —
    // excluding the previous pick so it never lands in the same spot twice.
    const previousAssignment = new Map(this.sectionAssignment);
    this.sectionAssignment.clear();
    this.recomputeSectionsWhenReady(previousAssignment);
  }

  closeBannerPopup() {
    this.isBannerPopupOpen = false;
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
