import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';

@Component({
  selector: 'app-product-sort',
  templateUrl: './product-sort.page.html',
  styleUrls: ['./product-sort.page.scss'],
})
export class ProductSortPage implements OnInit {
  isBtn = true;
  val = 0;
  public radioItems = [
    { text: "Featured Products", checked: false },
    { text: "-   Newest Products", checked: false },
    { text: "-   On Sale Products", checked: false },
    { text: "-   Price Low to High", checked: false },
    { text: "-   Price High to Low", checked: false }
  ]
  constructor(public modalCtrl: ModalController,
    public events: Events) { }

  ngOnInit() {
  }
  btnEnbDis(i) {
    if (i == 0 || i == 1 || i == 2 || i == 3 || i == 4) {
      this.radioItems[i].checked = true;
      this.isBtn = false;
    }
    else {
      this.isBtn = true;
    }
  }
  reset() {
    while (this.val < 5) {
      this.radioItems[this.val].checked = false;
      this.val = this.val + 1;
      
    }
    this.val=0;
    this.isBtn = true;
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.modalCtrl.dismiss();
  }
}
