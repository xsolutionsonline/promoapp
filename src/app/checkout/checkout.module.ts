import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckoutPageRoutingModule } from './checkout-routing.module';

import { CheckoutPage } from './checkout.page';
// reference of expandable component
import { ItemExpandComponentComponent } from '../components/item-expand-component/item-expand-component.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutPageRoutingModule
  ],
  declarations: [CheckoutPage, ItemExpandComponentComponent]
})
export class CheckoutPageModule { }
