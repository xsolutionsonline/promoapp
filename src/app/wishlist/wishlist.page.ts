import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { ModalController, ToastController, NavController } from '@ionic/angular';
import { Events } from '../services/events.service';
import { Firestore, collection, query, where, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  standalone: false,
})
export class WishlistPage implements OnInit {
  public visEmptyWishlist = false;
  public productCount = 0;
  public deleteProductId: string = '';
  public visiablePopup = false;
  public visProductSuccessful = false;
  public divBlur = "";
  public wishlistItems: any[] = [];

  constructor(
    private elementRef: ElementRef,
    private events: Events,
    private toastController: ToastController,
    private navCtrl: NavController,
    private firestore: Firestore
  ) {
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }

  ngOnInit() {
    this.getWishlistItems();
  }

  getWishlistItems() {
    const productsCollection = collection(this.firestore, 'products');
    const q = query(productsCollection, where('heartVis', '==', true));
    onSnapshot(q, (snapshot) => {
      debugger;
      this.wishlistItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.productCount = this.wishlistItems.length;
      this.visEmptyWishlist = this.productCount === 0;
    });
  }

  trashPopUp(item: any) {
    this.divBlur = "blur(6px)";
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    this.visiablePopup = true;
    this.deleteProductId = item.id;
  }

  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;
  }

  async itemDelete() {
    this.visProductSuccessful = true;
    const docRef = doc(this.firestore, 'products', this.deleteProductId);
    await updateDoc(docRef, { heartVis: false });

    setTimeout(() => {
      this.visProductSuccessful = false;
      this.visiablePopup = false;
      this.events.publish('blurValue', "blur(0px)");
    }, 2000);
  }

  itemNotDelete() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;
  }
}
