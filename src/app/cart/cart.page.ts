import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
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

  constructor(
    private router: Router,
    private firestore: Firestore,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.userUid = localStorage.getItem('user_order_uid');

    if (this.userUid) {
      this.loadCartItems();
    } else {
      // No user, so cart is empty
      this.visCartEmpty = true;
      this.cartItems = [];
      this.updateCartCount();
    }
  }

  async loadCartItems() {
    if (!this.userUid) return;

    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userUid', '==', this.userUid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const orderDocSnap = querySnapshot.docs[0];
      this.orderId = orderDocSnap.id; // Store the orderId for other operations
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
      console.log("No order document for this user!");
      this.visCartEmpty = true;
      this.cartItems = [];
      localStorage.removeItem('user_cart_order_id');
    }
    this.updateCartCount();
  }

  updateCartCount() {
    this.count = this.cartItems.length;
    this.cartItemsCount = this.count;
    if (this.count === 1) {
      this.displayItems = "Item";
    } else {
      this.displayItems = "Items";
    }
  }

  public editProduct(item) {
    item.visCard = false;
  }
  //for color
  isColorCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = true;
    }
    else {
      item.selectSize = true;
    }
  }
  isSelectedColorCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = false;
    }
    else {
      item.selectSize = true;
    }
  }
  //for size
  isSizeCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = true;
    }
    else {
      item.selectSize = true;
    }
  }
  isSelectSizeCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = false;
    }
    else {
      item.selectSize = true;
    }
  }
  addBtn() {
    this.productQuantity = this.productQuantity + 1;
    this.productPrice = this.productPrice + 90;
  }
  subBtn() {
    this.productQuantity = this.productQuantity - 1;
    this.productPrice = this.productPrice - 90;
    if (this.productQuantity < 1) {
      this.productQuantity = 1;
      this.productPrice = 90;
    }
  }
  cancel(item) {
    item.visCard = true;
  }
  update(item) {
    item.visCard = true;
  }
  deleteItem(item) {
    // This needs to be updated to modify Firestore and then reload
    /* item.visDeleteItem = false;
    this.count = this.count - 1;
    this.cartItemsCount = this.cartItemsCount - 1;

    if (this.count == 1) {
      this.displayItems = "Item"
    }
    if (this.count == 0) {
      this.visCartEmpty = true;
      this.displayItems = "Item"

    }
    */
  }
}
