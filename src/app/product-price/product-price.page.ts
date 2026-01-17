import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-product-price',
  templateUrl: './product-price.page.html',
  styleUrls: ['./product-price.page.scss'],
  styles: [
    '.range-pin{ background: red  }'
  ]
})
export class ProductPricePage implements OnInit {
  isBtn = true;
  structure: any = { lower: 50, upper: 150 };
  constructor(public modalCtrl: ModalController,
    public events: Events) { }

  ngOnInit() {
  }
  reset() {
    this.structure.lower = 50;
    this.structure.upper = 150;
  }
  range() {
    if (this.structure.lower != 50 || this.structure.upper != 150)
      this.isBtn = false;
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.modalCtrl.dismiss();
  }
}
