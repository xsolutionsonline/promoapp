import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './loading.component';
import {IonicModule} from "@ionic/angular";

@NgModule({
  imports: [CommonModule, IonicModule, LoadingComponent],
  exports: [LoadingComponent]
})
export class LoadingModule {}
