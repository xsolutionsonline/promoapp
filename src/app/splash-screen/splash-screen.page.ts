import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController } from '@ionic/angular';
import { DataServiceService } from '../services/data-service.service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
})
export class SplashScreenPage implements OnInit {

  constructor(public navCtrl: NavController, private service: DataServiceService,
    public events: Events, public splash: SplashScreen, public modalCtrl: ModalController) {
    // this.splash.hide();
    // setTimeout(() => {
    //   console.log("dismiss called");
    //   this.modalCtrl.dismiss();
    // }, 4000);
    // this.events.publish('tabActive', false);
  }
  ionViewDidEnter() {
    this.splash.hide();
    setTimeout(() => {
      console.log("dismiss called");
      this.modalCtrl.dismiss();
    }, 3000);
  }
  ngOnInit() { }
}