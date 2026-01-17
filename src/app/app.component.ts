import { Component, ElementRef } from '@angular/core';

import { Platform, Events, NavController, ModalController, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DataServiceService } from './services/data-service.service';
import { SplashScreenPage } from './splash-screen/splash-screen.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public menuToggle = true;
  public divBlur = "blur(0px)";
  public visTab = true;
  public login = false;
  public visProfileItem = false;
  public visEditprofile = false;
  public listItems = [
    { icon: "assets/icon/home-side.svg", text: "Home", visItem: true },
    { icon: "assets/icon/listview-side.svg", text: "Categories", visItem: true },
    { icon: "assets/icon/heart.svg", text: "Wishlist", visItem: true },
    { icon: "assets/icon/about-us.svg", text: "About Us", visItem: true },
    { icon: "assets/icon/contact-us.svg", text: "Contact Us", visItem: true },
    { icon: "assets/icon/privacy.svg", text: "Privacy Policy", visItem: true },
    { icon: "assets/icon/refund.svg", text: "Refund Policy", visItem: true },
    { icon: "assets/icon/terms.svg", text: "Terms & Services", visItem: true },
    { icon: "assets/icon/share.svg", text: "Share", visItem: true },
    { icon: "assets/icon/rate-us.svg", text: "Rate Us", visItem: true },
    { icon: "assets/icon/settings.svg", text: "Settings", visItem: true },
    { icon: "assets/icon/account-user.svg", text: "Edit Profile", visItem: true },
    { icon: "assets/icon/account-order.svg", text: "My Order", visItem: true },
    { icon: "assets/icon/address.svg", text: "My Addresses", visItem: true },
    { icon: "assets/icon/reward-points.svg", text: "Reward Points", visItem: true }
  ];
  public listInputItems = [
    { placeHolder: "First Name:", type: "text" },
    { placeHolder: "Last Name:", type: "text" },
    { placeHolder: "Password:", type: "password" },
    { placeHolder: "Email:", type: "email" },
    { placeHolder: "Phone:", type: "tel" },
    { placeHolder: "City:", type: "text" },
  ];
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private events: Events,
    private elementRef: ElementRef,
    public service: DataServiceService,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController
  ) {
    this.initializeApp();
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
    this.events.subscribe('tabActive', (data) => {
      this.visTab = data;
    });
    // service.getLogin().
    this.login = this.service.getLogin();
    console.log("I am in my app class and login value=" + this.login)
    if (this.login == true) {
      this.visProfileItem = true;
    }
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      //this.splashScreen.hide();
      this.SplashModal();
    });
  }
  async SplashModal() {
    console.log("splash modal fun");
    let modal = await this.modalCtrl.create({
      component: SplashScreenPage,
      componentProps: {
        'hideGuestLogin': true
      }
    });
    return await modal.present()
  }
  ionViewWillEnter() {
    this.login = this.service.getLogin();
    console.log("I am in my app class and login value=" + this.login)
    if (this.login == true) {
      this.visProfileItem = true;
    }
  }
  openMenu() {
    this.login = this.service.getLogin();
    console.log("I am in my app class and login value=" + this.login)
    if (this.login == true) {
      this.visProfileItem = true;
    }
  }
  goToPage(i) {
    if (i == 0) {
      this.navCtrl.navigateForward("home");
      this.menuToggle = true;
    }
    else if (i == 1) {
      this.navCtrl.navigateForward("categories");
      this.menuToggle = true;
    }
    else if (i == 2) {
      this.navCtrl.navigateForward("wishlist");
      this.menuToggle = true;
    }
    else if (i == 3) {
      // this.navCtrl.navigateForward("about-us");
      this.toastFun('about-us');
      this.menuToggle = false;
    }
    else if (i == 4) {
      this.navCtrl.navigateForward("contact-us");
      this.menuToggle = true;
    }
    else if (i == 5) {
      // this.navCtrl.navigateForward("privary-policy");
      this.toastFun('privacy-policy');
      this.menuToggle = false;
    }
    else if (i == 6) {
      // this.navCtrl.navigateForward("refund-policy");
      this.toastFun('refund-policy');
      this.menuToggle = false;
    }
    else if (i == 7) {
      // this.navCtrl.navigateForward("term-services");
      this.toastFun('term-services');
      this.menuToggle = false;
    }
    else if (i == 8) {
      // this.navCtrl.navigateForward("share");
      this.toastFun('share');
      this.menuToggle = false;
    }
    else if (i == 9) {
      this.navCtrl.navigateForward("review");
      this.menuToggle = true;
    }
    else if (i == 10) {
      // this.navCtrl.navigateForward("settings");
      this.toastFun('settings');
      this.menuToggle = false;
    }
    else if (i == 11) {
      this.navCtrl.navigateForward("my-account");
      this.menuToggle = true;
    }
    else if (i == 12) {
      this.navCtrl.navigateForward("my-order");
      this.menuToggle = true;
    }
    else if (i == 13) {
      this.navCtrl.navigateForward("my-addresses");
      this.menuToggle = true;
    }
    else if (i == 14) {
      this.navCtrl.navigateForward("reward-points");
      this.menuToggle = true;
    }
  }
  async toastFun(val) {
    if (val == 'about-us') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'About Us Clicked',
        duration: 2000
      });
      toast.present();
    }
    else if (val == 'privacy-policy') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Privacy Policy Clicked',
        duration: 2000
      });
      toast.present();
    }
    else if (val == 'refund-policy') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Refund Policy Clicked',
        duration: 2000
      });
      toast.present();
    }
    else if (val == 'term-services') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Term & Services Clicked',
        duration: 2000
      });
      toast.present();
    }
    else if (val == 'share') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Share Clicked',
        duration: 2000
      });
      toast.present();
    }
    else if (val == 'settings') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Settings Clicked',
        duration: 2000
      });
      toast.present();
    }
  }
  updateProfile() {
    this.visEditprofile = false;
  }
  goToLogin() {
    this.navCtrl.navigateForward("login");
  }
  ngOnInit() {
  }
}
