import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeModelPage } from './home-model.page';

const routes: Routes = [
  {
    path: '',
    component: HomeModelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeModelPageRoutingModule {}
