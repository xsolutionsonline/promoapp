import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  paymentBtn = true;
  billingToggle = true;
  visBilling = false;
  visSelectedUps = false;
  visFreeUps = false;
  visLocalPickUp = false;
  visCashOnDelivery = false;
  visMasterCard = false;
  public headerText = "Shipping Method";
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
  public shippingInput = [
    { placeholder: "First Name:", value: "", type: "text" },
    { placeholder: "Last Name:", value: "", type: "text" },
    { placeholder: "Address:", value: "", type: "text" },
    { placeholder: "Email:", value: "", type: "email" },
    { placeholder: "Phone:", value: "", type: "tel" },
    { placeholder: "City:", value: "", type: "text" },
  ];
  public billingInput = [
    { placeholder: "Billing First Name:", value: "", type: "text" },
    { placeholder: "Billing Last Name:", value: "", type: "text" },
    { placeholder: "Billing Address:", value: "", type: "text" },
    { placeholder: "Billing Email:", value: "", type: "email" },
    { placeholder: "Billing Phone:", value: "", type: "tel" },
    { placeholder: "Billing City:", value: "", type: "text" },
  ];
  public upsShippingItems = [];
  constructor(private loadingController: LoadingController) {
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
    if(val=='visInviteActive'){
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
  }
  btnEnbDis(i) {
    if (i == 0 || i == 1 || i == 2 || i == 3 || i == 4 || i == 5 || i == 6) {
      this.visSelectedUps = true;
      this.visFreeUps = false;
      this.visLocalPickUp = false;
    }
    else if (i == -1) {
      i = 0;
      this.visSelectedUps = false;
      this.visFreeUps = true;
      this.visLocalPickUp = false;
      while (i < 7) {
        console.log(i);
        this.upsShippingItems[0].upsShippingSubItems[i].selectItem = false;
        console.log("items are there" + this.upsShippingItems[0].upsShippingSubItems[i].selectItem);
        i = i + 1;
      }
    }
    else if (i == -2) {
      i = 0;
      this.visSelectedUps = false;
      this.visFreeUps = false;
      this.visLocalPickUp = true;
      while (i < 7) {
        console.log(i);
        this.upsShippingItems[0].upsShippingSubItems[i].selectItem = false;
        i = i + 1;
      }
    }
  }
  btnPayment(i) {
    this.paymentBtn = false;
    if (i == 0) {
      this.visMasterCard = true;
      this.visCashOnDelivery = false;
    }
    else if (i == 1) {
      this.visMasterCard = false;
      this.visCashOnDelivery = true;
    }
  }
}
