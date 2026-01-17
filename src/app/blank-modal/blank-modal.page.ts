import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-blank-modal',
  templateUrl: './blank-modal.page.html',
  styleUrls: ['./blank-modal.page.scss'],
})
export class BlankModalPage implements OnInit {

  constructor(public nav: NavController) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
      this.nav.navigateForward('intro');
  }
}