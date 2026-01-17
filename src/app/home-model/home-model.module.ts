import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeModelPageRoutingModule } from './home-model-routing.module';

import { HomeModelPage } from './home-model.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeModelPageRoutingModule
  ],
  declarations: [HomeModelPage]
})
export class HomeModelPageModule {}
