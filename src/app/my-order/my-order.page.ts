import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-my-order',
  templateUrl: './my-order.page.html',
  styleUrls: ['./my-order.page.scss'],
  standalone: false,
})
export class MyOrderPage implements OnInit {

  public selectedSegment: string = 'pending';
  public selectedOrder: any = null;
  public isModalOpen = false;

  public pendingItems: any[] = [];
  public confirmedItems: any[] = [];
  public deliceredItems: any[] = [];
  public deliveryItems: any[] = [];

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.getPendingOrders();
    this.getConfirmedOrders();
    this.getDeliveredOrders();
    this.getDeliveryOrders();
  }

  getPendingOrders() {
    this.firestoreService.getByAttribute<any>('orders', 'status', 'pending').subscribe(data => {
      this.pendingItems = data;
    });
  }

  getConfirmedOrders() {
    this.firestoreService.getByAttribute<any>('orders', 'status', 'confirmed').subscribe(data => {
      this.confirmedItems = data;
    });
  }

  getDeliveredOrders() {
    this.firestoreService.getByAttribute<any>('orders', 'status', 'Delivered').subscribe(data => {
      this.deliceredItems = data;
    });
  }

  getDeliveryOrders() {
    this.firestoreService.getByAttribute<any>('orders', 'status', 'In Delivery').subscribe(data => {
      this.deliveryItems = data;
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  showProducts(order: any) {
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  closeProducts() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }

  calculateTotalPrice(order: any): number {
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
