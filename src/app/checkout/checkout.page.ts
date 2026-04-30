import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ItemExpandComponentComponent } from '../components/item-expand-component/item-expand-component.component';
import { Router, RouterLink } from "@angular/router";
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ItemExpandComponentComponent,
    RouterLink
  ]
})
export class CheckoutPage implements OnInit {
  shippingForm: FormGroup;
  isSubmitted = false;
  paymentBtn = true;
  billingToggle = true;
  visBilling = false;
  visSelectedUps = false;
  visFreeUps = false;
  visLocalPickUp = false;
  visCashOnDelivery = false;
  visMasterCard = false;
  shippingMethodNotSelected = true;
  public headerText = "Shipping Address";
  public visInvite = false;
  public visTruck = true;
  public visPayment = true;
  public visLegal = true;
  public visInviteActive = true;
  public visTruckActive = false;
  public visPaymentActive = false;
  public visLegalActive = false;
  public visPin = true;
  public visTruckActiveForLines = true;
  public billingInput = [
    { placeholder: "Billing First Name:", value: "", type: "text" },
    { placeholder: "Billing Last Name:", value: "", type: "text" },
    { placeholder: "Billing Address:", value: "", type: "text" },
    { placeholder: "Billing Email:", value: "", type: "email" },
    { placeholder: "Billing Phone:", value: "", type: "tel" },
    { placeholder: "Billing City:", value: "", type: "text" },
  ];
  public upsShippingItems = [];

  public cartItems = [];
  private userUid: string = null;
  private orderId: string = null;
  public subtotal = 0;
  public delivery = 0;
  public discount = 0;
  public totalPrice = 0;
  public shippingAddress: string;
  public shippingMethod: string;
  public paymentMethod: string;

  private auth = inject(Auth);

  constructor(
    private loadingController: LoadingController,
    public formBuilder: FormBuilder,
    private toastController: ToastController,
    private firestore: Firestore,
    private router: Router
  ) {
    this.upsShippingItems = [
      {
        upsShippingSubItems: [
          { name: "Next Day Air", selectItem: false },
          { name: "2nd Day Air", selectItem: false },
          { name: "Ground", selectItem: false },
          { name: "3 Day Air", selectItem: false },
          { name: "Next Day AirSaver", selectItem: false },
          { name: "Next Day Early Air A.M", selectItem: false },
          { name: "2nd Day Air A.M", selectItem: false }
        ],
        expandedHelp: false,
      }
    ];
  }

  ngOnInit() {
    this.shippingForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]]
    });

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userUid = user.uid;
        this.loadCartItems();
      } else {
        this.userUid = null;
        this.router.navigate(['/login']);
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
      this.discount = orderData['discount'] || 0;
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
            name: product.productName,
            img: product.productImg,
            quantity: variant.quantity,
            price: getVariantDetail('group', 'price'),
            dprice: getVariantDetail('group', 'dprice'),
            variantDescription: variantDescription,
          });
        });
      });
      this.cartItems = flattenedItems;
      this.updateCartSummary();
    }
  }

  updateCartSummary() {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + item.dprice, 0);
    this.totalPrice = this.subtotal + this.delivery - this.discount;
  }

  get errorControl() {
    return this.shippingForm.controls;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2000 });
    toast.present();
  }

  segmentSelect(val) {
    if (val == 'invite' || val == 'inviteActive') {
      this.visInvite = false; this.visTruck = true; this.visPayment = true; this.visLegal = true;
      this.visInviteActive = true; this.visTruckActive = false; this.visPaymentActive = false; this.visLegalActive = false;
      this.headerText = "Shipping Address"; this.visPin = true; this.visTruckActiveForLines = true;
    } else if (val == 'truck' || val == 'truckActive') {
      this.visInvite = true; this.visTruck = false; this.visPayment = true; this.visLegal = true;
      this.visInviteActive = false; this.visTruckActive = true; this.visPaymentActive = false; this.visLegalActive = false;
      this.headerText = "Shipping Method"; this.visPin = false; this.visTruckActiveForLines = true;
    } else if (val == 'payment' || val == 'paymentActive') {
      this.visInvite = true; this.visTruck = true; this.visPayment = false; this.visLegal = true;
      this.visInviteActive = false; this.visTruckActive = false; this.visPaymentActive = true; this.visLegalActive = false;
      this.headerText = "Payment Method"; this.visPin = false; this.visTruckActiveForLines = false;
    } else if (val == 'legal' || val == 'legalActive') {
      this.visInvite = true; this.visTruck = true; this.visPayment = true; this.visLegal = false;
      this.visInviteActive = false; this.visTruckActive = false; this.visPaymentActive = false; this.visLegalActive = true;
      this.headerText = "Order Summary"; this.visPin = false; this.visTruckActiveForLines = false;
    }
  }

  async pinIndicator() {
    const loading = await this.loadingController.create({ message: 'Please Wait', duration: 2000 });
    await loading.present();
  }

  BillingToggleFun(e) {
    this.billingToggle = !this.billingToggle;
    this.visBilling = !this.visBilling;
  }

  expandCardFun(item) {
    const rightIconDown = document.getElementById('right-icon-arrow');
    if (rightIconDown) {
      rightIconDown.style.transform = rightIconDown.style.transform === 'rotate(90deg)' ? 'rotate(0deg)' : 'rotate(90deg)';
    }
    item.expandedHelp = !item.expandedHelp;
  }

  goNext(val) {
    this.isSubmitted = true;
    if (!this.shippingForm.valid) {
      this.presentToast('Please provide all the required values!');
      return false;
    }
    this.shippingAddress = `${this.shippingForm.value.address}, ${this.shippingForm.value.city}, ${this.shippingForm.value.postalCode}`;
    if (val == 'visInviteActive') {
      this.visTruckActiveForLines = true;
    } else if (val == 'activeTruckDelivery') {
      this.segmentSelect('truck');
    } else if (val == "activePayment") {
      if (this.shippingMethodNotSelected) {
        this.presentToast('Please select a shipping method!');
        return false;
      }
      this.segmentSelect('payment');
    } else if (val == "visLegalActive") {
      if (this.paymentBtn) {
        this.presentToast('Please select a payment method!');
        return false;
      }
      this.segmentSelect('legal');
    }
    return true;
  }

  btnEnbDis(i) {
    this.shippingMethodNotSelected = false;
    this.visSelectedUps = i >= 0;
    this.visFreeUps = i === -1;
    this.visLocalPickUp = i === -2;
    if (i >= 0) this.shippingMethod = this.upsShippingItems[0].upsShippingSubItems[i].name;
    if (i === -1) this.shippingMethod = "Free Shipping";
    if (i === -2) this.shippingMethod = "Local Pickup";
  }

  btnPayment(i) {
    this.paymentBtn = false;
    this.visMasterCard = i === 0;
    this.visCashOnDelivery = i === 1;
    if (i === 0) this.paymentMethod = "Debit/Master Card";
    if (i === 1) this.paymentMethod = "Cash On Delivery";
  }

  async confirmOrder() {
    if (!this.orderId) {
      this.presentToast('Error: No order to confirm.');
      return;
    }
    const orderRef = doc(this.firestore, 'orders', this.orderId);
    const dataToUpdate = {
      shippingAddress: this.shippingAddress,
      shippingMethod: this.shippingMethod,
      paymentMethod: this.paymentMethod,
      status: 'confirmed'
    };
    try {
      await updateDoc(orderRef, dataToUpdate);
      this.router.navigate(['/thankyou']);
    } catch (error) {
      this.presentToast('Error confirming order. Please try again.');
      console.error('Error updating document: ', error);
    }
  }
}
