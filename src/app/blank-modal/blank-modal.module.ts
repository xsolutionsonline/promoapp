import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlankModalPageRoutingModule } from './blank-modal-routing.module';

import { BlankModalPage } from './blank-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlankModalPageRoutingModule
  ],
  declarations: [BlankModalPage]
})
export class BlankModalPageModule {}
