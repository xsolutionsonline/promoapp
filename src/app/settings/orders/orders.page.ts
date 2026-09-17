import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { FirestoreService } from '../../services/firestore.service';
import { DropiOrder, DROPI_ORDER_COLUMNS } from '../../models/product.model';

// The order-management pipeline a Dropi/COD order actually goes through.
// Nothing else in the app writes a status besides "nuevo" at checkout — this
// page is what moves it along from here.
export const ORDER_STATUSES: { value: string; label: string; color: string }[] = [
  { value: 'nuevo', label: 'Nuevo', color: 'warning' },
  { value: 'confirmado', label: 'Confirmado', color: 'primary' },
  { value: 'enviado', label: 'Enviado', color: 'tertiary' },
  { value: 'entregado', label: 'Entregado', color: 'success' },
  { value: 'cancelado', label: 'Cancelado', color: 'danger' }
];

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: false,
})
export class OrdersPage implements OnInit {

  orders$: Observable<DropiOrder[]>;
  selectedIds: Set<string> = new Set();
  statuses = ORDER_STATUSES;
  statusFilter = 'all';
  updatingStatusIds: Set<string> = new Set();

  constructor(
    private firestoreService: FirestoreService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.orders$ = this.firestoreService.getAll<DropiOrder>('dropi-orders');
  }

  // Filtering client-side (not re-querying Firestore) keeps this in sync with
  // the same real-time listener the selection/export toolbar already uses.
  filterOrders(orders: DropiOrder[]): DropiOrder[] {
    if (this.statusFilter === 'all') { return orders; }
    return orders.filter(o => (o.status || 'nuevo') === this.statusFilter);
  }

  statusColor(status: string | undefined): string {
    return this.statuses.find(s => s.value === (status || 'nuevo'))?.color || 'medium';
  }

  statusLabel(status: string | undefined): string {
    return this.statuses.find(s => s.value === (status || 'nuevo'))?.label || (status || 'Nuevo');
  }

  async updateStatus(order: DropiOrder, event: any) {
    const newStatus = event?.detail?.value;
    if (!newStatus || newStatus === (order.status || 'nuevo')) { return; }

    this.updatingStatusIds.add(order.id);
    try {
      await this.firestoreService.update('dropi-orders', order.id, { status: newStatus });
      const toast = await this.toastController.create({
        message: `Pedido de ${order['NOMBRES']} actualizado a "${this.statusLabel(newStatus)}".`,
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Error actualizando el estado del pedido', error);
      const toast = await this.toastController.create({
        message: 'No se pudo actualizar el estado del pedido.',
        duration: 2500,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.updatingStatusIds.delete(order.id);
    }
  }

  goBack() {
    this.navCtrl.navigateBack('/product-list');
  }

  isSelected(order: DropiOrder): boolean {
    return this.selectedIds.has(order.id);
  }

  toggleSelected(order: DropiOrder) {
    if (this.selectedIds.has(order.id)) {
      this.selectedIds.delete(order.id);
    } else {
      this.selectedIds.add(order.id);
    }
  }

  toggleSelectAll(orders: DropiOrder[]) {
    if (this.selectedIds.size === orders.length) {
      this.selectedIds.clear();
    } else {
      this.selectedIds = new Set(orders.map(o => o.id));
    }
  }

  async downloadExcel(orders: DropiOrder[]) {
    const toExport = orders.filter(o => this.selectedIds.size === 0 || this.selectedIds.has(o.id));
    if (toExport.length === 0) {
      const toast = await this.toastController.create({
        message: 'No hay pedidos para descargar.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    // One row per Dropi product code/quantity, so a single order with several
    // Dropi products associated to its package becomes multiple rows sharing
    // the same customer/order data — matching Dropi's bulk upload format.
    // Each item already carries its own split value (see product-detail.page.ts
    // submitCheckout: accessory products keep their catalog value, the
    // principal product absorbs the remainder of the combo total).
    // "N° ORDEN", "NOMBRE PRODUCTO" and "PROVEEDOR" are appended after the
    // official columns — they're not part of Dropi's bulk-upload template,
    // just reference columns for us.
    const exportColumns = [...DROPI_ORDER_COLUMNS, 'N° ORDEN', 'NOMBRE PRODUCTO', 'PROVEEDOR'];
    const rows: Record<string, any>[] = [];
    toExport.forEach(order => {
      const items = order.dropiItems && order.dropiItems.length > 0
        ? order.dropiItems
        : [{ code: order['ID DE PRODUCTO'] || '', quantity: order['CANTIDAD'] || '', value: order['PRECIO TOTAL (SIN PUNTOS NI COMAS)'], name: order.productTitle || '', provider: '' }];

      items.forEach(item => {
        const row: Record<string, any> = {};
        DROPI_ORDER_COLUMNS.forEach(col => { row[col as string] = order[col] ?? ''; });
        row['ID DE PRODUCTO'] = item.code ?? '';
        row['CANTIDAD'] = item.quantity ?? '';
        row['PRECIO TOTAL (SIN PUNTOS NI COMAS)'] = item.value ?? order['PRECIO TOTAL (SIN PUNTOS NI COMAS)'] ?? '';
        row['N° ORDEN'] = order.orderNumber || '';
        row['NOMBRE PRODUCTO'] = (item as any).name || order.productTitle || '';
        row['PROVEEDOR'] = (item as any).provider || '';
        rows.push(row);
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: exportColumns as string[] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `pedidos-dropi-${dateStr}.xlsx`);
  }
}
