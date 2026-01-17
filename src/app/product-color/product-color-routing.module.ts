import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductColorPage } from './product-color.page';

const routes: Routes = [
  {
    path: '',
    component: ProductColorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductColorPageRoutingModule {}
