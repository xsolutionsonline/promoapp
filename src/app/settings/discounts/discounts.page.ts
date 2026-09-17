import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';
import { Bono } from '../../models/bono.model';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.page.html',
  styleUrls: ['./discounts.page.scss'],
  standalone: false,
})
export class DiscountsPage implements OnInit {

  bonos$: Observable<Bono[]>;

  newCode = '';
  newDiscountPercent: number | null = null;
  newDescription = '';
  isCreating = false;

  constructor(
    private firestoreService: FirestoreService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.bonos$ = this.firestoreService.getAll<Bono>('bonos');
  }

  goBack() {
    this.navCtrl.navigateBack('/product-list');
  }

  async createBono() {
    const code = this.newCode.trim().toUpperCase();
    const percent = this.newDiscountPercent;

    if (!code) {
      this.toast('Ingresa un código para el bono.', 'warning');
      return;
    }
    if (!percent || percent <= 0 || percent > 100) {
      this.toast('El descuento debe ser un número entre 1 y 100.', 'warning');
      return;
    }

    this.isCreating = true;
    try {
      const existing = await this.firestoreService.getById<Bono>('bonos', code);
      if (existing.exists()) {
        this.toast('Ya existe un bono con ese código.', 'danger');
        return;
      }
      await this.firestoreService.createWithId<Bono>('bonos', code, {
        discountPercent: percent,
        active: true,
        description: this.newDescription.trim(),
        createdAt: new Date()
      });
      this.toast(`Bono "${code}" creado.`, 'success');
      this.newCode = '';
      this.newDiscountPercent = null;
      this.newDescription = '';
    } catch (error) {
      console.error('Error creating bono', error);
      this.toast('No pudimos crear el bono. Intenta de nuevo.', 'danger');
    } finally {
      this.isCreating = false;
    }
  }

  toggleActive(bono: Bono) {
    const newActive = !bono.active;
    this.firestoreService.update('bonos', bono.id, { active: newActive });
  }

  saveDiscountPercent(bono: Bono) {
    if (!bono.discountPercent || bono.discountPercent <= 0 || bono.discountPercent > 100) {
      this.toast('El descuento debe ser un número entre 1 y 100.', 'warning');
      return;
    }
    this.firestoreService.update('bonos', bono.id, { discountPercent: bono.discountPercent });
    this.toast('Descuento actualizado.', 'success');
  }

  async confirmDelete(bono: Bono) {
    const alert = await this.alertController.create({
      header: 'Eliminar bono',
      message: `¿Eliminar el bono "${bono.id}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.firestoreService.delete('bonos', bono.id)
        }
      ]
    });
    await alert.present();
  }

  private async toast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 2500, color });
    toast.present();
  }
}
