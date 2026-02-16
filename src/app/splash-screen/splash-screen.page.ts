import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('splashVideo') splashVideo: ElementRef;
  public isVideoLoaded = false;

  constructor(public navCtrl: NavController, private service: DataServiceService,
    public events: Events, public modalCtrl: ModalController) {
  }

  async ionViewDidEnter() {
    await SplashScreen.hide();

    // Ensure video plays
    if (this.splashVideo && this.splashVideo.nativeElement) {
      this.splashVideo.nativeElement.muted = true; // Autoplay often requires muted

      // Add event listener for when video can play
      this.splashVideo.nativeElement.oncanplay = () => {
        this.isVideoLoaded = true;
        this.splashVideo.nativeElement.play().catch(error => {
          console.error("Error playing video:", error);
        });
      };

      // In case it's already ready
      if (this.splashVideo.nativeElement.readyState >= 3) {
         this.isVideoLoaded = true;
         this.splashVideo.nativeElement.play().catch(error => {
          console.error("Error playing video:", error);
        });
      }
    }

    setTimeout(() => {
      console.log("dismiss called");
      this.modalCtrl.dismiss();
    }, 3000);
  }
  ngOnInit() { }
}
