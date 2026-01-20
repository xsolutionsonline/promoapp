import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { DataServiceService } from '../services/data-service.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Events } from '../services/events.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
  standalone: false,
})
export class SplashScreenPage implements OnInit {

  constructor(public navCtrl: NavController, private service: DataServiceService,
    public events: Events, public modalCtrl: ModalController) {
    // this.splash.hide();
    // setTimeout(() => {
    //   console.log("dismiss called");
    //   this.modalCtrl.dismiss();
    // }, 4000);
    // this.events.publish('tabActive', false);
  }
  async ionViewDidEnter() {
    await SplashScreen.hide();
    setTimeout(() => {
      console.log("dismiss called");
      this.modalCtrl.dismiss();
    }, 3000);
  }
  ngOnInit() { }
}
