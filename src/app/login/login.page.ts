import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../services/data-service.service';
import { NavController } from '@ionic/angular';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  public login = false;
  public listLoginItems = [
    { icon: "assets/icon/username.svg", placeHolder: "Username", type: "text", bindingText: "" },
    { icon: "assets/icon/password.svg", placeHolder: "Password", type: "password", bindingText: "" },
  ];
  constructor(private service: DataServiceService,
    private navCtrl: NavController,
    private firestoreService: FirestoreService) { }

  ngOnInit() {
  }
  async isLogin() {
    if (this.listLoginItems[0].bindingText != "" && this.listLoginItems[1].bindingText != "") {
      const userDoc = await this.firestoreService.findDocByAttribute('customers', 'email', this.listLoginItems[0].bindingText);
      if (userDoc) {
        this.login = true;
        this.service.setLogin(this.login);
        this.service.setUserData(userDoc.data());
        this.navCtrl.navigateForward("home");
      }
    }
  }
}
