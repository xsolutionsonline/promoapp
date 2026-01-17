import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductColorPageRoutingModule } from './product-color-routing.module';

import { ProductColorPage } from './product-color.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductColorPageRoutingModule
  ],
  declarations: [ProductColorPage]
})
export class ProductColorPageModule {}
