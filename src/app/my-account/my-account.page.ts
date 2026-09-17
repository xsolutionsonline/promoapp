import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { DataServiceService } from '../services/data-service.service';
import { Auth, signOut, deleteUser } from '@angular/fire/auth';
import { FirestoreService } from '../services/firestore.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
  standalone: false,
})
export class MyAccountPage implements OnInit {
  public login = false;
  public visProfileItem = false;
  public visEditprofile = false;
  public isDeletingAccount = false;
  public bonoCode: string | null = null;
  private auth = inject(Auth);
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
  constructor(
    private navCtrl: NavController,
    private service: DataServiceService,
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
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
    this.loadBonoCode();
  }

  private async loadBonoCode() {
    const user = this.auth.currentUser;
    if (!user) { this.bonoCode = null; return; }
    try {
      const snap = await this.firestoreService.getById<any>('customers', user.uid);
      this.bonoCode = snap.exists() ? (snap.data()['bonoCode'] || null) : null;
    } catch (error) {
      console.error('Error cargando el código de bono', error);
    }
  }

  async copyBonoCode() {
    if (!this.bonoCode) { return; }
    const code = this.bonoCode;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      const toast = await this.toastController.create({
        message: 'Código copiado',
        duration: 1800,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error copiando el código de bono', error);
      const toast = await this.toastController.create({
        message: 'No pudimos copiar el código. Cópialo manualmente.',
        duration: 2500,
        color: 'danger'
      });
      await toast.present();
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

  private clearSession() {
    this.service.setLogin(false);
    this.service.setUserData(null);
    localStorage.removeItem('isLoginSucessFull');
    localStorage.removeItem('userData');
  }

  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Se eliminará tu cuenta de forma permanente. Tu historial de compras no se ve afectado. Esta acción no se puede deshacer.',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sí, eliminar', role: 'destructive', handler: () => this.deleteAccount() }
      ]
    });
    await alert.present();
  }

  // Deletes the Auth account first (the operation most likely to fail if the
  // session is stale — Firebase requires a recent login to delete a user), so
  // we never end up wiping the Firestore profile while the Auth account
  // survives.
  async deleteAccount() {
    const user = this.auth.currentUser;
    if (!user) { return; }

    this.isDeletingAccount = true;
    try {
      const uid = user.uid;
      await deleteUser(user);
      await this.firestoreService.delete('customers', uid);
      this.clearSession();
      const toast = await this.toastController.create({
        message: 'Tu cuenta fue eliminada.',
        duration: 2500,
        color: 'success'
      });
      await toast.present();
      this.navCtrl.navigateRoot('/home');
    } catch (error: any) {
      console.error('Error eliminando la cuenta', error);
      const needsReauth = error?.code === 'auth/requires-recent-login';
      const toast = await this.toastController.create({
        message: needsReauth
          ? 'Por seguridad, vuelve a iniciar sesión y luego intenta eliminar tu cuenta de nuevo.'
          : 'No pudimos eliminar tu cuenta. Intenta de nuevo.',
        duration: 3500,
        color: 'danger'
      });
      await toast.present();
      if (needsReauth) {
        await signOut(this.auth);
        this.clearSession();
        this.navCtrl.navigateForward('/login');
      }
    } finally {
      this.isDeletingAccount = false;
    }
  }

  ngOnInit() {
  }
}
