import { Component, OnInit } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';

@Component({
  selector: 'app-product-detail-modal',
  templateUrl: './product-detail-modal.page.html',
  styleUrls: ['./product-detail-modal.page.scss'],
})
export class ProductDetailModalPage implements OnInit {

  constructor(public modalCtrl: ModalController,
    public events: Events) { }

  ngOnInit() {
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.modalCtrl.dismiss();
  }
}
