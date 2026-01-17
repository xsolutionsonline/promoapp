import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductSizePageRoutingModule } from './product-size-routing.module';

import { ProductSizePage } from './product-size.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductSizePageRoutingModule
  ],
  declarations: [ProductSizePage]
})
export class ProductSizePageModule {}
