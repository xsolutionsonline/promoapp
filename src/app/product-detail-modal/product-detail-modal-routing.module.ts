import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductDetailModalPage } from './product-detail-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ProductDetailModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductDetailModalPageRoutingModule {}
