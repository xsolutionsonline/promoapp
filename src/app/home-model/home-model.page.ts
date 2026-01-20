import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Events } from '../services/events.service';

@Component({
  selector: 'app-home-model',
  templateUrl: './home-model.page.html',
  styleUrls: ['./home-model.page.scss'],
  standalone: false,
})
export class HomeModelPage implements OnInit {

  constructor(public modalCtrl: ModalController,
    public events: Events) { }

  ngOnInit() {
  }
  dismiss(){
    this.events.publish('blurValue', "blur(0px)");
    this.modalCtrl.dismiss();
  }

}
