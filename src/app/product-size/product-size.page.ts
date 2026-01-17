import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';

@Component({
  selector: 'app-product-size',
  templateUrl: './product-size.page.html',
  styleUrls: ['./product-size.page.scss'],
})
export class ProductSizePage implements OnInit {
  isBtn = true;
  val=0;
  public sizeItems = [
    { name: "S", text: "Small", selectSize: false },
    { name: "M", text: "Medium", selectSize: false },
    { name: "L", text: "Large", selectSize: false },
    { name: "XL", text: "Xtra Large", selectSize: false },
    { name: "XXL", text: "Double XL", selectSize: false },
  ];
  constructor(public modalCtrl: ModalController,
    public events: Events) { }

  ngOnInit() {
  }
  isSizeCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = true;
      console.log("yes");
    }
    else {
      item.selectSize = true;
      console.log("no");
    }
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.modalCtrl.dismiss();
  }
  btnEnbDis(i) {
    if (i == 0 || i == 1 || i == 2 || i == 3 || i == 4) {
      if (this.sizeItems[i].selectSize == true) {
        this.isBtn = false;
      }
    }
    else {
      this.isBtn = true;
    }
  }
  reset() {
    while (this.val < 5) {
      this.sizeItems[this.val].selectSize = false;
      this.val = this.val + 1;
    }
    this.val=0;
    this.isBtn = true;
  }
}
