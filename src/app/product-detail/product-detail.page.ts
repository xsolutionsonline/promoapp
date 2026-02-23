import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ModalController, ToastController, NavController } from '@ionic/angular';
//product detail modal
import { ProductDetailModalPage } from '../product-detail-modal/product-detail-modal.page'
import { Events } from '../services/events.service';
import { Router } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { LoadingService } from '../services/loading.service';
import {pendingUntilEvent} from "@angular/core/rxjs-interop";

interface GroupVariant {
  text: string;
  dprice: number;
  price: number;
  active: boolean;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: false,
})
export class ProductDetailPage implements OnInit, OnDestroy {
  @ViewChild('productSlider', { static: false }) productSlider: ElementRef;

  public visProductSuccessful = true;
  productQuantity = 1;
  productPrice = 90;
  productDPrice = 100; // Added for discount price
  public cartItemCount = 0;

  //for blur effect
  public visiablePopup = false;
  public divBlur = ""
  // for heart
  public visHeart = true;
  public categoryHeader = "Product Name Here";
  public slides = [
    "assets/images/product-detail/1.png",
    "assets/images/product-detail/2.png",
    "assets/images/product-detail/3.png",
  ];
  public productSlides = [
    { img: "assets/images/shoes/featured/1.png", name: "Product Name Will Go Here!", price: "100", dPrice: "150", feature: true, new: false, sale: false, heartVis: false },
    { img: "assets/images/shoes/sport/2.png", name: "Product Name Will Go Here!", price: "100", dPrice: "150", feature: false, new: true, sale: false, heartVis: false },
    { img: "assets/images/shoes/sale/2.png", name: "Product Name Will Go Here!", price: "100", dPrice: "150", feature: false, new: false, sale: true, heartVis: false }
  ];
  public colorItems = [];
  public sizeItems = [];
  public groupItems: GroupVariant[] = [];
  sliderConfig = {
    slidesPerView: 2.1,
    spaceBetween: 5,
    // pagination: {
    // el:'.swiper-pagination',
    // clickable: true,
    // }
  };

  // Variable to hold the current product data
  currentProduct: any = null;
  private currentOrderId: string = null;

  // Autoplay interval
  private autoplayInterval: any;

  constructor(private modalCtrl: ModalController,
    public events: Events, private elementRef: ElementRef,
    private toastController: ToastController,
    private navCtrl: NavController,
    private router: Router,
    private firestoreService: FirestoreService,
    private firestore: Firestore,
    private loadingService: LoadingService) {

    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }

  async updateOrderQuantity() {
    const useruid = localStorage.getItem('user_order_uid');
    if (!useruid) {
      this.cartItemCount = 0;
      return;
    }

    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userUid', '==', useruid), where('status', '==', 'pending'));


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

  getOrCreateUserUid(): string {
    let userUid = localStorage.getItem('user_order_uid');
    if (!userUid) {
      userUid = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('user_order_uid', userUid);
    }
    return userUid;
  }

  ngOnInit() {
    // Logic moved to ionViewWillEnter to handle cached views
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  initializeProductData(data: any) {
    if (data) {
      this.currentProduct = data;
      // Use title if available, otherwise fallback to text
      this.categoryHeader = data.title ? data.title : data.text;
      this.productPrice = parseFloat(data.price);
      this.productDPrice = parseFloat(data.dPrice);
      this.visHeart = !data.heartVis;

      // Update slides with the product images
      if (data.imgSlides && data.imgSlides.length > 0) {
        this.slides = data.imgSlides;
      } else if (data.img) {
        // Fallback if imgSlides is missing but img exists
        this.slides = [
          data.img,
          data.img,
          data.img
        ];
      }

      // Update similar products
      if (data.similarItems) {
        this.productSlides = data.similarItems;
      }

      // Initialize variants (colors and sizes) from product data
      if (data.variants) {
        this.colorItems = data.variants[0].colors || [];
        this.sizeItems = data.variants[0].sizes || [];
        this.groupItems = (data.variants[0].groups || []).map((group, index) => ({
          ...group,
          active: index === 0 // Set only the first item as active
        }));
      } else {
        this.colorItems = [];
        this.sizeItems = [];
        this.groupItems = [];
      }

      // Reset quantity
      this.productQuantity = 1;
      this.updateTotalPrice();
    }
  }

  selectGroup(selectedGroup: GroupVariant) {
    this.groupItems.forEach(group => group.active = (group.text === selectedGroup.text));
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    const selectedGroup = this.groupItems.find(g => g.active);

    let unitPrice;
    if (selectedGroup) {
      unitPrice = selectedGroup.dprice; // Use dprice for calculation as requested
    } else {
      unitPrice = this.currentProduct ? parseFloat(this.currentProduct.price) : 0;
    }

    this.productPrice = unitPrice * this.productQuantity;
  }

  ionViewDidLeave() {
    console.log("Leaving Product Detail - Resetting Data");
    this.stopAutoplay();
    this.currentProduct = null;
    this.categoryHeader = "Product Name Here";
    this.productPrice = 90;
    this.productDPrice = 100;
    this.visHeart = true;
    this.productQuantity = 1;
    this.slides = [
      "assets/images/product-detail/1.png",
      "assets/images/product-detail/2.png",
      "assets/images/product-detail/3.png",
    ];
    this.colorItems = [];
    this.sizeItems = [];
    // Reset similar products to default if needed, or keep the last ones until new ones load
    // this.productSlides = ...
  }

  startAutoplay() {
    this.stopAutoplay(); // Clear existing interval if any

    this.autoplayInterval = setInterval(() => {
      if (this.productSlider && this.productSlider.nativeElement) {
        const container = this.productSlider.nativeElement;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScrollLeft = scrollWidth - clientWidth;

        // Calculate next scroll position (scroll one item width roughly)
        // Assuming item width is roughly clientWidth (full width slide)
        let nextScrollLeft = container.scrollLeft + clientWidth;

        if (nextScrollLeft >= maxScrollLeft + 10) { // +10 buffer
          // Reset to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
        }
      }
    }, 10000); // 10 seconds
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  async share() {
    //toast controller
    const toast = await this.toastController.create({
      message: 'Product Share Clicked',
      duration: 2000
    });
    toast.present();
  }
  async heart() {
    // Toggle local state for immediate UI feedback
    this.visHeart = !this.visHeart;
    const newHeartVis = !this.visHeart; // The actual value to save in Firestore

    if (this.currentProduct && this.currentProduct.id) {
      const productDocRef = doc(this.firestore, `products/${this.currentProduct.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: newHeartVis });

        // Update the local currentProduct to stay in sync
        this.currentProduct.heartVis = newHeartVis;

        const message = newHeartVis ? 'Product Added To Wishlist' : 'Product Removed From Wishlist';
        const toast = await this.toastController.create({
          message: message,
          duration: 2000
        });
        toast.present();
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
        // Revert UI change on failure
        this.visHeart = !this.visHeart;
        const toast = await this.toastController.create({
          message: 'Failed to update wishlist status',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    }
  }
  async heartProduct(item) {
    // Toggle for immediate UI feedback
    item.heartVis = !item.heartVis;

    if (item && item.id) {
      const productDocRef = doc(this.firestore, `products/${item.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: item.heartVis });

        const message = item.heartVis ? 'Product Added To Wishlist' : 'Product Removed From Wishlist';
        const toast = await this.toastController.create({
          message: message,
          duration: 2000
        });
        toast.present();
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
        // Revert on failure
        item.heartVis = !item.heartVis;
        const toast = await this.toastController.create({
          message: 'Failed to update wishlist status',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    }
  }
  ionViewWillEnter() {
    // Check for data in history.state (Router State)
    // This runs every time the view enters, ensuring data is loaded even if cached
    if (history.state && history.state.product) {
      const data = history.state.product;
      console.log("Product received via history.state in ionViewWillEnter:", data);
      this.initializeProductData(data);
    }

    //value of blue from home modal
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
    });
    this.visiablePopup = false;//for blur effect
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);

    // Start autoplay when entering the view
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.startAutoplay();
    }, 1000);

    // Keep the event subscription as a fallback or if you use it elsewhere
    this.events.subscribe('product_detail', (data) => {
       // console.log("Product received via Event:", data);
       // this.initializeProductData(data);
    });
    this.updateOrderQuantity();
  }
  goToProductDetailModal() {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.divBlur = "blur(6px)"
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      this.visiablePopup = true;//for blur effect
    }, 2000);
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;//for disable blur effect
    this.divBlur = "blur(0px)"
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
  }
  //for color
  isColorCheck(item) {
    // Deselect all other colors
    this.colorItems.forEach(c => c.selectSize = false);
    item.selectSize = true;
  }
  isSelectedColorCheck(item) {
    item.selectSize = false;
  }
  //for size
  isSizeCheck(item) {
    // Deselect all other sizes
    this.sizeItems.forEach(s => s.selectSize = false);
    item.selectSize = true;
  }

  isSelectSizeCheck(item) {
    item.selectSize = false;
  }
  addBtn() {
    this.productQuantity++;
    this.updateTotalPrice();
  }
  subBtn() {
    if (this.productQuantity > 1) {
      this.productQuantity--;
      this.updateTotalPrice();
    }
  }
  goToReview() {
    this.navCtrl.navigateForward("review");
  }
  async goToproductSucessfull() {
    try {
      debugger;
      const useruid = this.getOrCreateUserUid();
      const selectedGroup = this.groupItems.find(g => g.active);
      const selectedColor = this.colorItems.find(c => c.selectSize);
      const selectedSize = this.sizeItems.find(s => s.selectSize);

      const newVariantInfo = {
        quantity: this.productQuantity,
        totalPrice: this.productPrice,
        selectedVariants: []
      };
      if (selectedGroup) newVariantInfo.selectedVariants.push({ type: 'group', ...selectedGroup });
      if (selectedColor) newVariantInfo.selectedVariants.push({ type: 'color', ...selectedColor });
      if (selectedSize) newVariantInfo.selectedVariants.push({ type: 'size', ...selectedSize });

      const ordersRef = collection(this.firestore, 'orders');
      const q = query(ordersRef, where('userUid', '==', useruid), where('status', '==', 'pending'));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // --- CREATE a new order document for this user ---
        const newProductEntry = {
          productId: this.currentProduct.id,
          productName: this.currentProduct.title || this.currentProduct.text,
          productImg: this.currentProduct.img,
          variants: [newVariantInfo],
        };

        const order = {
          userUid: useruid,
          products: [newProductEntry], // Array of products
          createdAt: new Date(),
          paymentStatus: 'pending',
          status: 'pending',
        };
        const docRef = await this.firestoreService.create('orders', order);
        this.currentOrderId = docRef.id; // Store the new order ID
      } else {
        // --- UPDATE existing order document ---
        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();
        this.currentOrderId = orderDoc.id; // Store the existing order ID
        const products = orderData['products'] || [];
        const orderDocRef = doc(this.firestore, 'orders', orderDoc.id);
        const q = query(ordersRef, where('userUid', '==', useruid), where('status', '==', 'pending'));


        const productIndex = products.findIndex(p => p.productId === this.currentProduct.id);

        if (productIndex > -1) {
          // Product is already in the cart, check for duplicate variant
          const existingProduct = products[productIndex];
          const existingVariants = existingProduct.variants || [];

          // Helper to compare variants
          const variantsAreEqual = (v1, v2) => {
            const getVariant = (arr, type) => arr.find(v => v.type === type);
            const group1 = getVariant(v1, 'group'), color1 = getVariant(v1, 'color'), size1 = getVariant(v1, 'size');
            const group2 = getVariant(v2, 'group'), color2 = getVariant(v2, 'color'), size2 = getVariant(v2, 'size');
            const groupMatch = (!group1 && !group2) || (group1?.text === group2?.text);
            const colorMatch = (!color1 && !color2) || (color1?.color === color2?.color);
            const sizeMatch = (!size1 && !size2) || (size1?.name === size2?.name);
            return groupMatch && colorMatch && sizeMatch;
          };

          const isDuplicate = existingVariants.some(variant => variantsAreEqual(variant.selectedVariants, newVariantInfo.selectedVariants));

          if (isDuplicate) {
            const toast = await this.toastController.create({
              message: 'This product configuration is already in your cart.',
              duration: 3000,
              color: 'warning',
              position: 'top'
            });
            toast.present();
            return; // Stop execution
          }

          // Add new variant to the existing product's variants array
          existingProduct.variants.push(newVariantInfo);
        } else {
          // Product is not in the cart, add it as a new entry
          const newProductEntry = {
            productId: this.currentProduct.id,
            productName: this.currentProduct.title || this.currentProduct.text,
            productImg: this.currentProduct.img,
            variants: [newVariantInfo],
          };
          products.push(newProductEntry);
        }

        // Update the entire products array in the document
        await updateDoc(orderDocRef, {
          products: products
        });
      }

      // Show success view after creating/updating
      this.visProductSuccessful = false;

    } catch (error) {
      console.error("Error creating/updating order:", error);
      const toast = await this.toastController.create({
        message: 'There was an error placing your order. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }
  goToCart() {
    this.loadingService.show();
    this.events.publish('blurValue', "blur(0px)");
    this.visProductSuccessful = true;
    // Pass the orderId to the cart page
    setTimeout(() => {
      this.loadingService.hide();
      this.navCtrl.navigateForward('cart', {
        state: {
          orderId: this.currentOrderId
        }
      });
    }, 2000);
  }
  goToHome() {
    this.events.publish('blurValue', "blur(0px)");
    this.visProductSuccessful = true;
    this.navCtrl.navigateForward("home");
  }
}
