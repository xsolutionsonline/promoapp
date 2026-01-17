import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-my-order',
  templateUrl: './my-order.page.html',
  styleUrls: ['./my-order.page.scss'],
})
export class MyOrderPage implements OnInit {
  seg2 = 2;
  public inProgress = true;
  public inProgressActive = false;
  public delivered = false;
  public deliveredActive = true;
  public cancelled = true;
  public cancelledActive = false;
  animationLeft = false;
  // for deliverd details
  public visDeliveredDetails = false;
  public progressItems = [
    { orderId: "#1902", date: "Jul 30, 2019", price: "USD 229.00", status: "In Progress" },
    { orderId: "#1902", date: "Jul 30, 2019", price: "USD 229.00", status: "In Transit" },
  ];
  public deliceredItems = [
    { orderId: "#1902", date: "Jul 30, 2019", price: "USD 229.00", status: "Delivered" },
  ];
  public cancelledItems = [
    { orderId: "#1902", date: "Jul 30, 2019", price: "USD 229.00", status: "Cancelled", cancelledReason: "*Cancel Reason: Order cancelled due to technical error!" },
  ];
  public deliveredCards = [
    { headerText: "Shipping Address", contentText: "123, Abc, New York, USA" },
    { headerText: "Billing Address", contentText: "123, Abc, New York, USA" },
    { headerText: "Shipping Method", contentText: "Free Shipping" },
  ];
  constructor() { }

  ngOnInit() {
  }
  segmentSelected(val) {
    if (val == "inProgress") {
      this.inProgress = false;
      this.inProgressActive = true;
      this.delivered = true;
      this.deliveredActive = false;
      this.cancelled = true;
      this.cancelledActive = false;
      this.seg2 = 1;
      console.log(this.seg2);
    }
    else if (val == "inProgressActive") {
      this.inProgress = false;
      this.inProgressActive = true;
      this.delivered = true;
      this.deliveredActive = false;
      this.cancelled = true;
      this.cancelledActive = false;
      console.log(this.seg2);
    }
    else if (val == "delivered") {
      this.inProgress = true;
      this.inProgressActive = false;
      this.delivered = false;
      this.deliveredActive = true;
      this.cancelled = true;
      this.cancelledActive = false;
      console.log(this.seg2);
      if (this.seg2 == 1) {
        this.animationLeft = true;
        console.log("animation=left");
      }
      else if (this.seg2 == 3) {
        this.animationLeft = false;
        console.log("animation=right");
      }
    }
    else if (val == "deliveredActive") {
      this.inProgress = true;
      this.inProgressActive = false;
      this.delivered = false;
      this.deliveredActive = true;
      this.cancelled = true;
      this.cancelledActive = false;
      console.log(this.seg2);
    }
    else if (val == "cancelled") {
      this.inProgress = true;
      this.inProgressActive = false;
      this.delivered = true;
      this.deliveredActive = false;
      this.cancelled = false;
      this.cancelledActive = true;
      this.seg2 = 3;
      console.log(this.seg2);
    }
    else if (val == "cancelledActive") {
      this.inProgress = true;
      this.inProgressActive = false;
      this.delivered = true;
      this.deliveredActive = false;
      this.cancelled = false;
      this.cancelledActive = true;
      console.log(this.seg2);
    }
  }
  deliveredFun() {
    this.visDeliveredDetails = true;
  }
}
