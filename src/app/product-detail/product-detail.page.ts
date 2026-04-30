import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, OnDestroy, inject } from '@angular/core';
import { ModalController, ToastController, NavController, IonicModule } from '@ionic/angular';
import { ProductDetailModalPage } from '../product-detail-modal/product-detail-modal.page';
import { Events } from '../services/events.service';
import { Router, RouterLink } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { LoadingService } from '../services/loading.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class ProductDetailPage implements OnInit, OnDestroy {
  @ViewChild('productSlider', { static: false }) productSlider: ElementRef;

  public visProductSuccessful = true;
  productQuantity = 1;
  productPrice = 90;
  productDPrice = 100;
  public cartItemCount = 0;

  public visiablePopup = false;
  public divBlur = ""
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
  };

  currentProduct: any = null;
  private currentOrderId: string = null;
  private autoplayInterval: any;

  private auth = inject(Auth);
  private userUID: string | null = null;

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

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userUID = user.uid;
      } else {
        this.userUID = null;
      }
      this.updateOrderQuantity();
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

  ngOnInit() {
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  initializeProductData(data: any) {
    if (data) {
      this.currentProduct = data;
      this.categoryHeader = data.title ? data.title : data.text;
      this.productPrice = parseFloat(data.price);
      this.productDPrice = parseFloat(data.dPrice);
      this.visHeart = !data.heartVis;

      if (data.imgSlides && data.imgSlides.length > 0) {
        this.slides = data.imgSlides;
      } else if (data.img) {
        this.slides = [data.img, data.img, data.img];
      }

      if (data.similarItems) {
        this.productSlides = data.similarItems;
      }

      if (data.variants) {
        this.colorItems = data.variants[0].colors || [];
        this.sizeItems = data.variants[0].sizes || [];
        this.groupItems = (data.variants[0].groups || []).map((group, index) => ({
          ...group,
          active: index === 0
        }));
      } else {
        this.colorItems = [];
        this.sizeItems = [];
        this.groupItems = [];
      }

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
    let unitPrice = selectedGroup ? selectedGroup.dprice : (this.currentProduct ? parseFloat(this.currentProduct.price) : 0);
    this.productPrice = unitPrice * this.productQuantity;
  }

  ionViewDidLeave() {
    this.stopAutoplay();
    this.currentProduct = null;
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      if (this.productSlider && this.productSlider.nativeElement) {
        const container = this.productSlider.nativeElement;
        const nextScrollLeft = container.scrollLeft + container.clientWidth;
        if (nextScrollLeft >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
        }
      }
    }, 10000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  async share() {
    const toast = await this.toastController.create({ message: 'Product Share Clicked', duration: 2000 });
    toast.present();
  }

  async heart() {
    this.visHeart = !this.visHeart;
    const newHeartVis = !this.visHeart;

    if (this.currentProduct && this.currentProduct.id) {
      const productDocRef = doc(this.firestore, `products/${this.currentProduct.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: newHeartVis });
        this.currentProduct.heartVis = newHeartVis;
        const message = newHeartVis ? 'Product Added To Wishlist' : 'Product Removed From Wishlist';
        const toast = await this.toastController.create({ message, duration: 2000 });
        toast.present();
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
        this.visHeart = !this.visHeart;
        const toast = await this.toastController.create({ message: 'Failed to update wishlist status', duration: 2000, color: 'danger' });
        toast.present();
      }
    }
  }

  async heartProduct(item) {
    item.heartVis = !item.heartVis;
    if (item && item.id) {
      const productDocRef = doc(this.firestore, `products/${item.id}`);
      try {
        await updateDoc(productDocRef, { heartVis: item.heartVis });
        const message = item.heartVis ? 'Product Added To Wishlist' : 'Product Removed From Wishlist';
        const toast = await this.toastController.create({ message, duration: 2000 });
        toast.present();
      } catch (e) {
        console.error('Error updating heartVis in Firestore', e);
        item.heartVis = !item.heartVis;
        const toast = await this.toastController.create({ message: 'Failed to update wishlist status', duration: 2000, color: 'danger' });
        toast.present();
      }
    }
  }

  ionViewWillEnter() {
    if (history.state && history.state.product) {
      this.initializeProductData(history.state.product);
    }
    this.events.subscribe('blurValue', (data) => { this.divBlur = data; });
    this.visiablePopup = false;
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    setTimeout(() => { this.startAutoplay(); }, 1000);
    this.updateOrderQuantity();
  }

  goToProductDetailModal() {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.divBlur = "blur(6px)";
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      this.visiablePopup = true;
    }, 2000);
  }

  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;
    this.divBlur = "blur(0px)";
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
  }

  isColorCheck(item) {
    this.colorItems.forEach(c => c.selectSize = false);
    item.selectSize = true;
  }

  isSelectedColorCheck(item) {
    item.selectSize = false;
  }

  isSizeCheck(item) {
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
    if (!this.userUID) {
      const toast = await this.toastController.create({
        message: 'Please log in to add products to your cart.',
        duration: 3000,
        color: 'warning',
        position: 'top'
      });
      toast.present();
      this.navCtrl.navigateForward('/login');
      return;
    }

    try {
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
      const q = query(ordersRef, where('userUid', '==', this.userUID), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const newProductEntry = {
          productId: this.currentProduct.id,
          productName: this.currentProduct.title || this.currentProduct.text,
          productImg: this.currentProduct.img,
          variants: [newVariantInfo],
        };
        const order = {
          userUid: this.userUID,
          products: [newProductEntry],
          createdAt: new Date(),
          paymentStatus: 'pending',
          status: 'pending',
        };
        const docRef = await this.firestoreService.create('orders', order);
        this.currentOrderId = docRef.id;
      } else {
        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();
        this.currentOrderId = orderDoc.id;
        const products = orderData['products'] || [];
        const orderDocRef = doc(this.firestore, 'orders', orderDoc.id);

        const productIndex = products.findIndex(p => p.productId === this.currentProduct.id);

        if (productIndex > -1) {
          const existingProduct = products[productIndex];
          const variantsAreEqual = (v1, v2) => {
            const getVariant = (arr, type) => arr.find(v => v.type === type);
            const group1 = getVariant(v1, 'group'), color1 = getVariant(v1, 'color'), size1 = getVariant(v1, 'size');
            const group2 = getVariant(v2, 'group'), color2 = getVariant(v2, 'color'), size2 = getVariant(v2, 'size');
            const groupMatch = (!group1 && !group2) || (group1?.text === group2?.text);
            const colorMatch = (!color1 && !color2) || (color1?.color === color2?.color);
            const sizeMatch = (!size1 && !size2) || (size1?.name === size2?.name);
            return groupMatch && colorMatch && sizeMatch;
          };
          const isDuplicate = existingProduct.variants.some(variant => variantsAreEqual(variant.selectedVariants, newVariantInfo.selectedVariants));

          if (isDuplicate) {
            const toast = await this.toastController.create({ message: 'This product configuration is already in your cart.', duration: 3000, color: 'warning', position: 'top' });
            toast.present();
            return;
          }
          existingProduct.variants.push(newVariantInfo);
        } else {
          const newProductEntry = {
            productId: this.currentProduct.id,
            productName: this.currentProduct.title || this.currentProduct.text,
            productImg: this.currentProduct.img,
            variants: [newVariantInfo],
          };
          products.push(newProductEntry);
        }
        await updateDoc(orderDocRef, { products: products });
      }
      this.visProductSuccessful = false;
    } catch (error) {
      console.error("Error creating/updating order:", error);
      const toast = await this.toastController.create({ message: 'There was an error placing your order. Please try again.', duration: 3000, color: 'danger' });
      toast.present();
    }
  }

  goToCart() {
    this.loadingService.show();
    this.events.publish('blurValue', "blur(0px)");
    this.visProductSuccessful = true;
    setTimeout(() => {
      this.loadingService.hide();
      this.navCtrl.navigateForward('cart', { state: { orderId: this.currentOrderId } });
    }, 2000);
  }

  goToHome() {
    this.events.publish('blurValue', "blur(0px)");
    this.visProductSuccessful = true;
    this.navCtrl.navigateForward("home");
  }
}
