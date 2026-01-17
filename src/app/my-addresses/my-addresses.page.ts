import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-my-addresses',
  templateUrl: './my-addresses.page.html',
  styleUrls: ['./my-addresses.page.scss'],
})
export class MyAddressesPage implements OnInit {
  public shipping = false;
  public shippingActive = true;
  public billing = true;
  public billingActive = false;
  public listInputItems = [
    { placeHolder: "First Name:", type: "text" },
    { placeHolder: "Last Name:", type: "text" },
    { placeHolder: "Company:", type: "text" },
    { placeHolder: "Address 1:", type: "text" },
    { placeHolder: "Address 2:", type: "text" },
    { placeHolder: "Country:", type: "text" },
    { placeHolder: "State:", type: "text" },
    { placeHolder: "City:", type: "text" },
    { placeHolder: "Postal Code:", type: "text" },
  ];
  constructor() { }

  segmentSelected(val) {
    if (val == "shipping") {
      this.shipping = false;
      this.shippingActive = true;
      this.billing = true;
      this.billingActive = false;
    }
    else if (val == "shippingActive") {
      this.shipping = false;
      this.shippingActive = true;
      this.billing = true;
      this.billingActive = false;
    }
    else if (val == "billing") {
      this.shipping = true;
      this.shippingActive = false;
      this.billing = false;
      this.billingActive = true;
    }
    else if (val == "billingActive") {
      this.shipping = true;
      this.shippingActive = false;
      this.billing = false;
      this.billingActive = true;
    }
  }
  ngOnInit() {
  }

}
