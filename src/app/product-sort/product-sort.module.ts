import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductSortPageRoutingModule } from './product-sort-routing.module';

import { ProductSortPage } from './product-sort.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductSortPageRoutingModule
  ],
  declarations: [ProductSortPage]
})
export class ProductSortPageModule {}
