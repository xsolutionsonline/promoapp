import { Component, OnInit, ElementRef } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';

@Component({
  selector: 'app-product-color',
  templateUrl: './product-color.page.html',
  styleUrls: ['./product-color.page.scss'],
})
export class ProductColorPage implements OnInit {
  bgColor = "";
  isBtn = true;
  val = 0;
  public sizeItems = [
    { color: "#1C197A", bgRadius: "8px solid #1C197A", text: "Blue", selectSize: false },
    { color: "#5A197A", bgRadius: "8px solid #5A197A", text: "Purple", selectSize: false },
    { color: "#913523", bgRadius: "8px solid #913523", text: "Brown", selectSize: false },
    { color: "#7A6719", bgRadius: "8px solid #7A6719", text: "Camel", selectSize: false },
    { color: "#33581A", bgRadius: "8px solid #33581A", text: "Green", selectSize: false },
    { color: "#000000", bgRadius: "8px solid #000000", text: "Black", selectSize: false },
    { color: "#7D7D7D", bgRadius: "8px solid #7D7D7D", text: "Grey", selectSize: false },
    { color: "#AF9306", bgRadius: "8px solid #AF9306", text: "Mustard", selectSize: false },
    { color: "#36BDD9", bgRadius: "8px solid #36BDD9", text: "Blue", selectSize: false },
    { color: "#7A197A", bgRadius: "8px solid #7A197A", text: "Magneta", selectSize: false },
    { color: "#40197A", bgRadius: "8px solid #40197A", text: "Purple", selectSize: false },
    { color: "#72000C", bgRadius: "8px solid #72000C", text: "Red", selectSize: false },
  ];
  constructor(public modalCtrl: ModalController,
    public events: Events,
    public elementRef: ElementRef) {
  }
  ionViewWillEnter() {
    // for (var item in this.sizeItems) {
    //   console.log(item, this.sizeItems[item].bgRadius);
    // }
  }

  ngOnInit() {
  }
  isColorCheck(item) {
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
    if (i == 0 || i == 1 || i == 2 || i == 3 || i == 4 ||
      i == 5 || i == 6 || i == 7 || i == 8 || i == 9 ||
      i == 10 || i == 11) {
      if (this.sizeItems[i].selectSize == true) {
        this.isBtn = false;
      }
    }
    else {
      this.isBtn = true;
    }
  }
  reset() {
    while (this.val < 12) {
      this.sizeItems[this.val].selectSize = false;
      this.val = this.val + 1;
    }
    this.val=0;
    this.isBtn = true;
  }
}