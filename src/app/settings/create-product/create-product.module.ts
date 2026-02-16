import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateProductPageRoutingModule } from './create-product-routing.module';
import { CreateProductPage } from './create-product.page';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Import ReactiveFormsModule
    IonicModule,
    CreateProductPageRoutingModule
  ],
  declarations: [CreateProductPage, ImageUploadComponent]
})
export class CreateProductPageModule {}
