import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductDetailModalPageRoutingModule } from './product-detail-modal-routing.module';

import { ProductDetailModalPage } from './product-detail-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductDetailModalPageRoutingModule
  ],
  declarations: [ProductDetailModalPage]
})
export class ProductDetailModalPageModule {}
