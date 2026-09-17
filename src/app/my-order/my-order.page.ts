import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';

interface DropiOrderItem {
  code: string;
  name?: string;
  provider?: string;
  quantity: number;
  value: number;
  isMain: boolean;
}

// Matches what product-detail.page.ts (submitCheckout) writes to the
// "dropi-orders" collection — not a generic e-commerce order shape. Extra
// (add-on) products are just more rows in dropiItems, not a separate list.
interface MyOrder {
  id: string;
  productTitle?: string;
  dropiItems?: DropiOrderItem[];
  createdAt?: any;
  status?: string;
  orderNumber?: string;
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

  public orders: MyOrder[] = [];
  public isLoading = true;
  public isLoggedIn = true;
  public selectedOrder: MyOrder | null = null;
  public isModalOpen = false;

  private auth = inject(Auth);

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.isLoggedIn = true;
        this.loadOrders(user.uid);
      } else {
        this.isLoggedIn = false;
        this.orders = [];
        this.isLoading = false;
      }
    });
  }

  private async loadOrders(uid: string) {
    this.isLoading = true;

    const queries: Observable<MyOrder[]>[] = [
      this.firestoreService.getByAttribute<MyOrder>('dropi-orders', 'userUid', uid)
    ];

    // Orders placed before "userUid" started getting stamped on checkout (or
    // as a guest, before this account existed) don't carry it — fall back to
    // matching by the phone/email on file so those still show up here too.
    try {
      const customerSnap = await this.firestoreService.getById<any>('customers', uid);
      const customer = customerSnap.exists() ? customerSnap.data() : null;
      if (customer?.['whatsapp']) {
        queries.push(this.firestoreService.getByAttribute<MyOrder>('dropi-orders', 'TELEFONO', customer['whatsapp']));
      }
      if (customer?.['email']) {
        queries.push(this.firestoreService.getByAttribute<MyOrder>('dropi-orders', 'EMAIL (NO OBLIGATORIO)', customer['email']));
      }
    } catch (error) {
      console.error('Error loading customer profile for order matching', error);
    }

    combineLatest(queries).subscribe(resultsArrays => {
      const merged = new Map<string, MyOrder>();
      resultsArrays.forEach(list => list.forEach(order => merged.set(order.id, order)));
      this.orders = [...merged.values()].sort((a, b) => this.orderTimestamp(b) - this.orderTimestamp(a));
      this.isLoading = false;
    });
  }

  private orderTimestamp(order: MyOrder): number {
    const created = order.createdAt;
    if (!created) { return 0; }
    return created.seconds ? created.seconds * 1000 : new Date(created).getTime();
  }

  showProducts(order: MyOrder) {
    this.selectedOrder = order;
    this.isModalOpen = true;
  }

  closeProducts() {
    this.isModalOpen = false;
    this.selectedOrder = null;
  }
}
