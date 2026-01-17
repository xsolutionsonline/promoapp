import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductPricePageRoutingModule } from './product-price-routing.module';

import { ProductPricePage } from './product-price.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductPricePageRoutingModule
  ],
  declarations: [ProductPricePage]
})
export class ProductPricePageModule {}
