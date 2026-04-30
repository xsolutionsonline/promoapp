import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Order {
  id: string;
  products?: any[];
  discount?: number;
  createdAt?: any; // O un tipo más específico como 'Date' o 'Timestamp' si lo tienes
  [key: string]: any;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-my-order',
  templateUrl: './my-order.page.html',
  styleUrls: ['./my-order.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class MyOrderPage implements OnInit {

  public selectedSegment: string = 'pending';
  public selectedOrder: Order | null = null;
  public isModalOpen = false;

  public pendingItems: Order[] = [];
  public confirmedItems: Order[] = [];
  public deliceredItems: Order[] = [];
  public deliveryItems: Order[] = [];

  private auth = inject(Auth);
  private userUID: string | null = null;

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userUID = user.uid;
      } else {
        this.userUID = null;
      }
      this.loadOrders();
    });
  }

  loadOrders() {
    this.getPendingOrders();
    this.getConfirmedOrders();
    this.getDeliveredOrders();
    this.getDeliveryOrders();
  }

  getPendingOrders() {
    this.firestoreService.getByAttribute<Order>('orders', 'status', 'pending', this.userUID).subscribe(data => {
      this.pendingItems = data;
    });
  }

  getConfirmedOrders() {
    this.firestoreService.getByAttribute<Order>('orders', 'status', 'confirmed', this.userUID).subscribe(data => {
      this.confirmedItems = data;
    });
  }

  getDeliveredOrders() {
    this.firestoreService.getByAttribute<Order>('orders', 'status', 'Delivered', this.userUID).subscribe(data => {
      this.deliceredItems = data;
    });
  }

  getDeliveryOrders() {
    this.firestoreService.getByAttribute<Order>('orders', 'status', 'In Delivery', this.userUID).subscribe(data => {
      this.deliveryItems = data;
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  showProducts(order: Order) {
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  closeProducts() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  calculateTotalPrice(order: Order): number {
    if (!order || !order.products) {
      return 0;
    }

    let total = order.products.reduce((sum, product) => {
      const productTotal = product.variants.reduce((subTotal, variant) => subTotal + variant.totalPrice, 0);
      return sum + productTotal;
    }, 0);

    if (order.discount && typeof order.discount === 'number' && order.discount > 0) {
      total -= order.discount;
    }

    return total;
  }
}
