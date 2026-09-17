import { Component, OnInit, inject } from '@angular/core';
import { DataServiceService } from '../services/data-service.service';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  public login = false;
  public isSubmitting = false;
  public listLoginItems = [
    { icon: "assets/icon/username.svg", placeHolder: "Usuario (correo)", type: "email", bindingText: "" },
    { icon: "assets/icon/password.svg", placeHolder: "Contraseña", type: "password", bindingText: "" },
  ];

  private auth = inject(Auth);
  private returnUrl = '/home';

  constructor(private service: DataServiceService,
    private navCtrl: NavController,
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private toastController: ToastController) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
  }

  async isLogin() {
    const email = this.listLoginItems[0].bindingText.trim();
    const password = this.listLoginItems[1].bindingText;
    if (!email || !password || this.isSubmitting) { return; }

    this.isSubmitting = true;
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const userDoc = await this.firestoreService.getById('customers', credential.user.uid);
      this.login = true;
      this.service.setLogin(this.login);
      this.service.setUserData(userDoc.exists() ? userDoc.data() : { email });
      this.navCtrl.navigateForward(this.returnUrl);
    } catch (error) {
      console.error('Error de inicio de sesión', error);
      const toast = await this.toastController.create({
        message: 'Usuario o contraseña incorrectos.',
        duration: 2500,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.isSubmitting = false;
    }
  }
}
