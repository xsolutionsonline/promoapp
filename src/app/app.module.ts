import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// for home modal
import { HomeModelPageModule } from './home-model/home-model.module';
// for product models
import { ProductColorPageModule } from './product-color/product-color.module';
import { ProductPricePageModule } from './product-price/product-price.module';
import { ProductSizePageModule } from './product-size/product-size.module';
import { ProductSortPageModule } from './product-sort/product-sort.module';
import { BlankModalPageModule } from './blank-modal/blank-modal.module';
// for product detail modal
import { ProductDetailModalPageModule } from './product-detail-modal/product-detail-modal.module';
import { SplashScreenPageModule } from './splash-screen/splash-screen.module';
import { LoadingModule } from './loading/loading.module';

import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BlankModalPageModule,
    HomeModelPageModule,
    ProductColorPageModule,
    ProductPricePageModule,
    ProductSizePageModule,
    ProductSortPageModule,
    ProductDetailModalPageModule,
    SplashScreenPageModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    LoadingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
