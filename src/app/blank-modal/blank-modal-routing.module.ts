import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlankModalPage } from './blank-modal.page';

const routes: Routes = [
  {
    path: '',
    component: BlankModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlankModalPageRoutingModule {}
