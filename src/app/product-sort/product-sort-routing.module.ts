import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductSortPage } from './product-sort.page';

const routes: Routes = [
  {
    path: '',
    component: ProductSortPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductSortPageRoutingModule {}
