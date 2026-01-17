import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RewardPointsPage } from './reward-points.page';

const routes: Routes = [
  {
    path: '',
    component: RewardPointsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RewardPointsPageRoutingModule {}
