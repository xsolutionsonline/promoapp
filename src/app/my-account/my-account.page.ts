import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataServiceService } from '../services/data-service.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
})
export class MyAccountPage implements OnInit {
  public login = false;
  public visProfileItem = false;
  public visEditprofile = false;
  public listItems = [
    { icon: "assets/icon/account-user.svg", text: "Edit Profile", visItem: false },
    { icon: "assets/icon/account-order.svg", text: "My Order", visItem: false },
    { icon: "assets/icon/address.svg", text: "My Addresses", visItem: false },
    { icon: "assets/icon/reward-points.svg", text: "Reward Points", visItem: false },
    { icon: "assets/icon/about-us.svg", text: "About Us", visItem: true },
    { icon: "assets/icon/contact-us.svg", text: "Contact Us", visItem: true },
    { icon: "assets/icon/privacy.svg", text: "Privacy Policy", visItem: true },
    { icon: "assets/icon/refund.svg", text: "Refund Policy", visItem: true },
    { icon: "assets/icon/terms.svg", text: "Terms & Services", visItem: true },
    { icon: "assets/icon/share.svg", text: "Share", visItem: true },
    { icon: "assets/icon/rate-us.svg", text: "Rate Us", visItem: true },
    { icon: "assets/icon/settings.svg", url: "/", text: "Settings", visItem: true },
  ];
  public listInputItems = [
    { placeHolder: "First Name:", type: "text" },
    { placeHolder: "Last Name:", type: "text" },
    { placeHolder: "Password:", type: "password" },
    { placeHolder: "Email:", type: "email" },
    { placeHolder: "Phone:", type: "tel" },
    { placeHolder: "City:", type: "text" },
  ];
  constructor(private navCtrl: NavController, private service: DataServiceService) {
    // service.getLogin().
    this.login = this.service.getLogin();
    console.log("I am in my account class and login value=" + this.login)
    if (this.login == true) {
      this.listItems[0].visItem = true;
      this.listItems[1].visItem = true;
      this.listItems[2].visItem = true;
      this.listItems[3].visItem = true;
      this.visProfileItem = true;
    }
  }
  ionViewWillEnter() {
    this.login = this.service.getLogin();
    console.log("I am in my account class and login value=" + this.login)
    if (this.login == true) {
      this.listItems[0].visItem = true;
      this.listItems[1].visItem = true;
      this.listItems[2].visItem = true;
      this.listItems[3].visItem = true;
      this.visProfileItem = true;
    }
  }
  goToPage(i) {
    if (i == 0) {
      this.visEditprofile = true;
    }
    else if (i == 1) {
      this.navCtrl.navigateForward("my-order")
    }
    else if (i == 2) {
      this.navCtrl.navigateForward("my-addresses")
    }
    else if (i == 3) {
      this.navCtrl.navigateForward("reward-points")
    }
    else if (i == 4) {
      this.navCtrl.navigateForward("")
    }
    else if (i == 5) {
      this.navCtrl.navigateForward("contact-us")
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
