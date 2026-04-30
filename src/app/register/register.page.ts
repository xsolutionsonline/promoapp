import { Component, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importaciones de la nueva API modular de Firebase
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class RegisterPage {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Inyección de dependencias con la nueva API
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private navCtrl = inject(NavController);

  constructor() {}

  goBack() {
    this.navCtrl.back();
  }

  async register() {
    if (this.password !== this.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      // Aquí puedes agregar una alerta para notificar al usuario
      return;
    }

    try {
      // Creación del usuario con la nueva API
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      if (userCredential.user) {
        // Guardado de datos en Firestore con la nueva API
        const userDocRef = doc(this.firestore, `customers/${userCredential.user.uid}`);
        await setDoc(userDocRef, {
          fullName: this.fullName,
          email: this.email,
          password: '', // Guardando una contraseña vacía como se solicitó
        });
        this.navCtrl.navigateForward('/login');
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      // Aquí puedes agregar una alerta para notificar al usuario sobre el error
    }
  }
}
