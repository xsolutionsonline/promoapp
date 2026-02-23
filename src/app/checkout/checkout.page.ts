import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ItemExpandComponentComponent } from '../components/item-expand-component/item-expand-component.component';
import { Router, RouterLink } from "@angular/router";
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';

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
    this.userUid = localStorage.getItem('user_order_uid');
    if (this.userUid) {
      this.loadCartItems();
    }
  }

  async loadCartItems() {
    if (!this.userUid) return;

    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, where('userUid', '==', this.userUid));
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
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  segmentSelect(val) {
    if (val == 'invite') {
      this.visInvite = false;
      this.visTruck = true;
      this.visPayment = true;
      this.visLegal = true;
      this.visInviteActive = true;
      this.visTruckActive = false;
      this.visPaymentActive = false;
      this.visLegalActive = false;
      this.headerText = "Shipping Address";
      this.visPin = true;
      this.visTruckActiveForLines = true;
    }
    else if (val == 'inviteActive') {
      this.visInvite = false;
      this.visTruck = true;
      this.visPayment = true;
      this.visLegal = true;
      this.visInviteActive = true;
      this.visTruckActive = false;
      this.visPaymentActive = false;
      this.visLegalActive = false;
      this.headerText = "Shipping Address";
      this.visPin = true;
      this.visTruckActiveForLines = true;
    }
    else if (val == 'truck') {
      this.visInvite = true;
      this.visTruck = false;
      this.visPayment = true;
      this.visLegal = true;
      this.visInviteActive = false;
      this.visTruckActive = true;
      this.visPaymentActive = false;
      this.visLegalActive = false;
      this.headerText = "Shipping Method";
      this.visPin = false;
      this.visTruckActiveForLines = true;
    }
    else if (val == 'truckActive') {
      this.visInvite = true;
      this.visTruck = false;
      this.visPayment = true;
      this.visLegal = true;
      this.visInviteActive = false;
      this.visTruckActive = true;
      this.visPaymentActive = false;
      this.visLegalActive = false;
      this.headerText = "Shipping Method";
      this.visPin = false;
      this.visTruckActiveForLines = true;
    }
    else if (val == 'payment') {
      this.visInvite = true;
      this.visTruck = true;
      this.visPayment = false;
      this.visLegal = true;
      this.visInviteActive = false;
      this.visTruckActive = false;
      this.visPaymentActive = true;
      this.visLegalActive = false;
      this.headerText = "Payment Method";
      this.visPin = false;
      this.visTruckActiveForLines = false;
    }
    else if (val == 'paymentActive') {
      this.visInvite = true;
      this.visTruck = true;
      this.visPayment = false;
      this.visLegal = true;
      this.visInviteActive = false;
      this.visTruckActive = false;
      this.visPaymentActive = true;
      this.visLegalActive = false;
      this.headerText = "Payment Method";
      this.visPin = false;
      this.visTruckActiveForLines = false;
    }
    else if (val == 'legal') {
      this.visInvite = true;
      this.visTruck = true;
      this.visPayment = true;
      this.visLegal = false;
      this.visInviteActive = false;
      this.visTruckActive = false;
      this.visPaymentActive = false;
      this.visLegalActive = true;
      this.headerText = "Order Summary";
      this.visPin = false;
      this.visTruckActiveForLines = false;
    }
    else if (val == 'legalActive') {
      this.visInvite = true;
      this.visTruck = true;
      this.visPayment = true;
      this.visLegal = false;
      this.visInviteActive = false;
      this.visTruckActive = false;
      this.visPaymentActive = false;
      this.visLegalActive = true;
      this.headerText = "Order Summary";
      this.visPin = false;
      this.visTruckActiveForLines = false;
    }
  }
  async pinIndicator() {
    const loading = await this.loadingController.create({
      message: 'Please Wait',
      duration: 2000
    });
    await loading.present();
  }
  BillingToggleFun(e) {
    this.billingToggle = !this.billingToggle;
    this.visBilling = !this.visBilling;
    console.log(this.visBilling);
    console.log(this.billingToggle);
  }
  expandCardFun(item) {
    const rightIconDown = document.getElementById('right-icon-arrow');
    if (rightIconDown.style.transform == '') {
      rightIconDown.style.transition = 'width 1s, height 1s, transform 1s';
      rightIconDown.style.transform = 'rotate(90deg)';
      console.log("null condition for icon");
    }
    else if (rightIconDown.style.transform == 'rotate(90deg)') {
      rightIconDown.style.transition = 'width 1s, height 1s, transform 1s';
      rightIconDown.style.transform = 'rotate(0deg)';
      console.log("rotate(90deg) condition for icon");
    }
    else if (rightIconDown.style.transform == 'rotate(0deg)') {
      rightIconDown.style.transition = 'width 1s, height 1s, transform 1s';
      rightIconDown.style.transform = 'rotate(90deg)';
      console.log("rotate(0deg) condition for icon");
    }

    if (item.expandedHelp) {
      item.expandedHelp = false;
      console.log("item.expandedHelp = false");
    }
    else {
      this.upsShippingItems.map(listItem => {
        if (item == listItem) {
          listItem.expanded = !listItem.expanded;
          console.log("if");
        }
        else {
          console.log("else");
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }
  goNext(val) {
    this.isSubmitted = true;
    if (!this.shippingForm.valid) {
      this.presentToast('Please provide all the required values!');
      return false;
    } else {
      this.shippingAddress = `${this.shippingForm.value.address}, ${this.shippingForm.value.city}, ${this.shippingForm.value.postalCode}`;
      if (val == 'visInviteActive') {
        this.visTruckActiveForLines = true;
      }
      else if (val == 'activeTruckDelivery') {
        this.visInvite = true;
        this.visTruck = false;
        this.visPayment = true;
        this.visLegal = true;
        this.visInviteActive = false;
        this.visTruckActive = true;
        this.visPaymentActive = false;
        this.visLegalActive = false;
        this.headerText = "Shipping Method";
      }
      else if (val == "activePayment") {
        if (this.shippingMethodNotSelected) {
          this.presentToast('Please select a shipping method!');
          return false;
        }
        this.visInvite = true;
        this.visTruck = true;
        this.visPayment = false;
        this.visLegal = true;
        this.visInviteActive = false;
        this.visTruckActive = false;
        this.visPaymentActive = true;
        this.visLegalActive = false;
        this.headerText = "Payment Method";
      }
      else if (val == "visLegalActive") {
        if (this.paymentBtn) {
          this.presentToast('Please select a payment method!');
          return false;
        }
        this.visInvite = true;
        this.visTruck = true;
        this.visPayment = true;
        this.visLegal = false;
        this.visInviteActive = false;
        this.visTruckActive = false;
        this.visPaymentActive = false;
        this.visLegalActive = true;
        this.headerText = "Order Summary";
      }
      return true;
    }
  }
  btnEnbDis(i) {
    this.shippingMethodNotSelected = false;
    if (i >= 0) {
      this.shippingMethod = this.upsShippingItems[0].upsShippingSubItems[i].name;
      this.visSelectedUps = true;
      this.visFreeUps = false;
      this.visLocalPickUp = false;
    }
    else if (i == -1) {
      this.shippingMethod = "Free Shipping";
      this.visSelectedUps = false;
      this.visFreeUps = true;
      this.visLocalPickUp = false;
    }
    else if (i == -2) {
      this.shippingMethod = "Local Pickup";
      this.visSelectedUps = false;
      this.visFreeUps = false;
      this.visLocalPickUp = true;
    }
  }
  btnPayment(i) {
    this.paymentBtn = false;
    if (i == 0) {
      this.paymentMethod = "Debit/Master Card";
      this.visMasterCard = true;
      this.visCashOnDelivery = false;
    }
    else if (i == 1) {
      this.paymentMethod = "Cash On Delivery";
      this.visMasterCard = false;
      this.visCashOnDelivery = true;
    }
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
