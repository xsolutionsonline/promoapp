import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Firestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { ToastController, IonicModule } from '@ionic/angular';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class CartPage implements OnInit {
  displayItems = "Items"
  visCartEmpty = false;
  count = 0;
  productQuantity = 1;
  productPrice = 90;
  public cartItemsCount = 0;
  public cartItems = [];
  private orderId: string = null;
  private userUid: string = null;

  public subtotal = 0;
  public discount = 0;
  public discountPercentage = 0;
  public delivery = 0;
  public totalPrice = 0;
  public couponCode: string = '';

  private auth = inject(Auth);

  constructor(
    private router: Router,
    private firestore: Firestore,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userUid = user.uid;
        this.loadCartItems();
      } else {
        this.userUid = null;
        this.visCartEmpty = true;
        this.cartItems = [];
        this.updateCartSummary();
      }
    });
  }

  async loadCartItems() {
    if (!this.userUid) return;

    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userUid', '==', this.userUid), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const orderDocSnap = querySnapshot.docs[0];
      this.orderId = orderDocSnap.id;
      const orderData = orderDocSnap.data();
      const products = orderData['products'] || [];
      const flattenedItems = [];

      products.forEach(product => {
        product.variants.forEach(variant => {
          const getVariantDetail = (type, field) => {
            const v = variant.selectedVariants.find(sv => sv.type === type);
            return v ? v[field] : null;
          };
          const variantDescription = [
            getVariantDetail('group', 'text'),
            getVariantDetail('color', 'text'),
            getVariantDetail('size', 'text')
          ].filter(Boolean).join(' / ');
          flattenedItems.push({
            productId: product.productId,
            name: product.productName,
            img: product.productImg,
            quantity: variant.quantity,
            price: variant.totalPrice,
            dprice: variant.totalPrice - (variant.totalPrice * 0.1),
            color: getVariantDetail('color', 'color'),
            size: getVariantDetail('size', 'name'),
            group: getVariantDetail('group', 'text'),
            variantDescription: variantDescription,
            bgRadius: `solid 8px ${getVariantDetail('color', 'color') || 'transparent'}`,
            subItemsColor: [],
            subItemsSize: [],
            visCard: true,
            visDeleteItem: true,
            variantId: Math.random().toString(36).substring(2, 9)
          });
        });
      });
      this.cartItems = flattenedItems;
      this.visCartEmpty = this.cartItems.length === 0;
    } else {
      this.visCartEmpty = true;
      this.cartItems = [];
    }
    this.updateCartSummary();
  }

  updateCartSummary() {
    this.cartItemsCount = this.cartItems.length;
    this.displayItems = this.cartItemsCount === 1 ? "Item" : "Items";
    this.subtotal = this.cartItems.reduce((acc, item) => acc + item.dprice, 0);
    this.totalPrice = this.subtotal + this.delivery - this.discount;
  }

  async applyCoupon() {
    if (!this.couponCode.trim()) {
      this.presentToast("Please enter a coupon code.");
      return;
    }
    const couponsRef = collection(this.firestore, 'coupons');
    const q = query(couponsRef, where('code', '==', this.couponCode.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      this.presentToast("Coupon not found.");
      return;
    }
    const couponDoc = querySnapshot.docs[0];
    const couponData = couponDoc.data();

    if (!couponData['active']) {
      this.presentToast("This coupon is no longer active.");
      return;
    }
    this.discountPercentage = couponData['discount'];
    this.discount = this.subtotal * (this.discountPercentage / 100);
    this.updateCartSummary();

    if (this.orderId) {
      const orderRef = doc(this.firestore, 'orders', this.orderId);
      await updateDoc(orderRef, {
        discount: this.discount,
        couponCode: this.couponCode.trim()
      });
    }
    this.presentToast("Coupon applied successfully!");
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000 });
    toast.present();
  }

  public editProduct(item) {
    item.visCard = false;
  }
  isColorCheck(item) {
    item.selectSize = true;
  }
  isSelectedColorCheck(item) {
    item.selectSize = false;
  }
  isSizeCheck(item) {
    item.selectSize = true;
  }
  isSelectSizeCheck(item) {
    item.selectSize = false;
  }
  addBtn() {
    this.productQuantity++;
    this.productPrice += 90;
  }
  subBtn() {
    if (this.productQuantity > 1) {
      this.productQuantity--;
      this.productPrice -= 90;
    }
  }
  cancel(item) {
    item.visCard = true;
  }
  update(item) {
    item.visCard = true;
  }
  async deleteItem(itemToDelete) {
    if (!this.orderId) return;
    const orderRef = doc(this.firestore, 'orders', this.orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      const orderData = orderSnap.data();
      let products = orderData['products'] || [];
      const productIndex = products.findIndex(p => p.productId === itemToDelete.productId);

      if (productIndex > -1) {
        const product = products[productIndex];
        const variantIndex = product.variants.findIndex(variant => {
          const getVariantDetail = (type, field) => {
            const v = variant.selectedVariants.find(sv => sv.type === type);
            return v ? v[field] : null;
          };
          return itemToDelete.color === getVariantDetail('color', 'color') &&
                 itemToDelete.size === getVariantDetail('size', 'name') &&
                 itemToDelete.group === getVariantDetail('group', 'text');
        });

        if (variantIndex > -1) {
          product.variants.splice(variantIndex, 1);
          if (product.variants.length === 0) {
            products.splice(productIndex, 1);
          }
          await updateDoc(orderRef, { products });
          this.loadCartItems();
        }
      }
    }
  }
}
