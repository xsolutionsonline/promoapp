import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RewardPointsPageRoutingModule } from './reward-points-routing.module';

import { RewardPointsPage } from './reward-points.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RewardPointsPageRoutingModule
  ],
  declarations: [RewardPointsPage]
})
export class RewardPointsPageModule {}
