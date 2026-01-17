import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductSizePage } from './product-size.page';

const routes: Routes = [
  {
    path: '',
    component: ProductSizePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductSizePageRoutingModule {}
