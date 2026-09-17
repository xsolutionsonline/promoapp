import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
  standalone: false,
})
export class ProductListPage implements OnInit {

  products$: Observable<(Product & { id: string })[]>;
  deletingIds: Set<string> = new Set();

  constructor(
    private firestoreService: FirestoreService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.products$ = this.firestoreService.getAll<Product>('products');
  }

  createProduct() {
    this.navCtrl.navigateForward('/create-product');
  }

  goToOrders() {
    this.navCtrl.navigateForward('/orders');
  }

  goToDiscounts() {
    this.navCtrl.navigateForward('/discounts');
  }

  editProduct(id: string) {
    this.navCtrl.navigateForward('/create-product/' + id);
  }

  async confirmDeleteProduct(product: Product & { id: string }) {
    const alert = await this.alertController.create({
      header: '¿Eliminar producto?',
      message: `Se eliminará "${product.title}" de forma permanente. Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteProduct(product.id) }
      ]
    });
    await alert.present();
  }

  private async deleteProduct(id: string) {
    this.deletingIds.add(id);
    try {
      await this.firestoreService.delete('products', id);
      const toast = await this.toastController.create({
        message: 'Producto eliminado.',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Error eliminando el producto', error);
      const toast = await this.toastController.create({
        message: 'No se pudo eliminar el producto. Intenta de nuevo.',
        duration: 2500,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.deletingIds.delete(id);
    }
  }
}
