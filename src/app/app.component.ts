import { Component, ElementRef, inject } from '@angular/core';

import { Platform, NavController, ModalController, ToastController } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { DataServiceService } from './services/data-service.service';
import { SplashScreenPage } from './splash-screen/splash-screen.page';
import { Events } from './services/events.service';
import { Auth, authState, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public menuToggle = true;
  public divBlur = "blur(0px)";
  public visTab = true;
  public login = false;
  public visProfileItem = false;
  public visEditprofile = false;
  public userName = '';
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  public listItems = [
    { icon: "assets/icon/home-side.svg", text: "Inicio", visItem: true },
    { icon: "assets/icon/listview-side.svg", text: "Categories", visItem: false },
    { icon: "assets/icon/heart.svg", text: "Favortios", visItem: true },
    { icon: "assets/icon/about-us.svg", text: "About Us", visItem: false },
    { icon: "assets/icon/contact-us.svg", text: "Contact Us", visItem: false },
    { icon: "assets/icon/privacy.svg", text: "Privacy Policy", visItem: false },
    { icon: "assets/icon/refund.svg", text: "Refund Policy", visItem: false },
    { icon: "assets/icon/terms.svg", text: "Terms & Services", visItem: false },
    { icon: "assets/icon/share.svg", text: "Share", visItem: false },
    { icon: "assets/icon/rate-us.svg", text: "Rate Us", visItem: false },
    { icon: "assets/icon/settings.svg", text: "Administración", visItem: false },
    { icon: "assets/icon/account-user.svg", text: "Editar Perfil", visItem: true },
    { icon: "assets/icon/account-order.svg", text: "Mis Compras", visItem: true },
    { icon: "assets/icon/address.svg", text: "Mis Direcciones", visItem: true },
    { icon: "assets/icon/reward-points.svg", text: "Redimir Puntos", visItem: true }
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
    authState(this.auth).subscribe(user => this.refreshAdminMenuItem(user ? user.uid : null));
    // service.getLogin().
    this.login = this.service.getLogin();
    console.log("I am in my app class and login value=" + this.login)
    if (this.login == true) {
      this.visProfileItem = true;
      const userData = this.service.getUserData();
      if (userData) {
        this.userName = userData.fullName;
      }
    }
  }
  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        StatusBar.setStyle({ style: Style.Default });
      }
      //this.splashScreen.hide();
      // A direct link straight into a product page (e.g. shared from an ad)
      // shows its own "50off.png" loading popup while the product fetches —
      // showing the generic splash.mp4 first on top of that would be redundant.
      // SplashScreenPage (the video modal) is what normally calls
      // SplashScreen.hide() once it's done — skipping it means we must hide
      // the native splash ourselves, or its launch image (the EuroCity logo)
      // stays on screen forever.
      if (/^\/product-detail(\/|$)/.test(window.location.pathname)) {
        SplashScreen.hide();
      } else {
        this.SplashModal();
      }
    });
  }
  // The "Administración" side-menu item only makes sense for admins, so it
  // stays hidden until we confirm customers/{uid}.role === 'admin' — the same
  // check adminGuard uses to protect the routes it links to.
  private async refreshAdminMenuItem(uid: string | null) {
    let isAdmin = false;
    if (uid) {
      try {
        const snap = await getDoc(doc(this.firestore, `customers/${uid}`));
        isAdmin = snap.exists() && (snap.data() as any)?.role === 'admin';
      } catch (e) {
        console.error('Error checking admin role', e);
      }
    }
    this.listItems[10].visItem = isAdmin;
  }
  async SplashModal() {
    console.log("splash modal fun");
    let modal = await this.modalCtrl.create({
      component: SplashScreenPage,
      cssClass: 'transparent-modal', // Add this class
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
      const userData = this.service.getUserData();
      if (userData) {
        this.userName = userData.fullName;
      }
    }
  }
  openMenu() {
    this.login = this.service.getLogin();
    console.log("I am in my app class and login value=" + this.login)
    if (this.login == true) {
      this.visProfileItem = true;
      const userData = this.service.getUserData();
      if (userData) {
        this.userName = userData.fullName;
      }
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
      this.navCtrl.navigateForward("settings");
      //this.toastFun('settings');
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
      await toast.present();
    }
    else if (val == 'privacy-policy') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Privacy Policy Clicked',
        duration: 2000
      });
      await toast.present();
    }
    else if (val == 'refund-policy') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Refund Policy Clicked',
        duration: 2000
      });
      await toast.present();
    }
    else if (val == 'term-services') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Term & Services Clicked',
        duration: 2000
      });
      await toast.present();
    }
    else if (val == 'share') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Share Clicked',
        duration: 2000
      });
      await toast.present();
    }
    else if (val == 'settings') {
      //toast controller
      const toast = await this.toastCtrl.create({
        message: 'Settings Clicked',
        duration: 2000
      });
      await toast.present();
    }
  }
  updateProfile() {
    this.visEditprofile = false;
  }
  goToLogin() {
    this.navCtrl.navigateForward("login");
  }
  async logout() {
    await signOut(this.auth);
    this.service.setLogin(false);
    this.service.setUserData(null);
    localStorage.removeItem('isLoginSucessFull');
    localStorage.removeItem('userData');
    this.visProfileItem = false;
    this.userName = '';
    this.navCtrl.navigateForward("home");
  }
  ngOnInit() {
  }
}
