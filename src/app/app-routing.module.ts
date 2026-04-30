import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  {
    path: 'home-model',
    loadChildren: () => import('./home-model/home-model.module').then(m => m.HomeModelPageModule)
  },
  {
    path: 'blank-modal',
    loadChildren: () => import('./blank-modal/blank-modal.module').then(m => m.BlankModalPageModule)
  },
  {
    path: 'category-detail',
    loadChildren: () => import('./category-detail/category-detail.module').then(m => m.CategoryDetailPageModule)
  },
  {
    path: 'product-sort',
    loadChildren: () => import('./product-sort/product-sort.module').then(m => m.ProductSortPageModule)
  },
  {
    path: 'product-size',
    loadChildren: () => import('./product-size/product-size.module').then(m => m.ProductSizePageModule)
  },
  {
    path: 'product-price',
    loadChildren: () => import('./product-price/product-price.module').then(m => m.ProductPricePageModule)
  },
  {
    path: 'product-color',
    loadChildren: () => import('./product-color/product-color.module').then(m => m.ProductColorPageModule)
  },
  {
    path: 'product-detail',
    loadComponent: () => import('./product-detail/product-detail.page').then(m => m.ProductDetailPage)
  },
  {
    path: 'product-detail-modal',
    loadChildren: () => import('./product-detail-modal/product-detail-modal.module').then(m => m.ProductDetailModalPageModule)
  },
  {
    path: 'review',
    loadChildren: () => import('./review/review.module').then(m => m.ReviewPageModule)
  },
  {
    path: 'my-account',
    loadChildren: () => import('./my-account/my-account.module').then(m => m.MyAccountPageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesPageModule)
  },
  {
    path: 'wishlist',
    loadChildren: () => import('./wishlist/wishlist.module').then(m => m.WishlistPageModule)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then(m => m.CartPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.page').then(m => m.CheckoutPage)
  },
  {
    path: 'thankyou',
    loadComponent: () => import('./thankyou/thankyou.page').then(m => m.ThankyouPage)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'forget',
    loadChildren: () => import('./forget/forget.module').then(m => m.ForgetPageModule)
  },
  {
    path: 'my-order',
    loadComponent: () => import('./my-order/my-order.page').then(m => m.MyOrderPage)
  },
  {
    path: 'reward-points',
    loadChildren: () => import('./reward-points/reward-points.module').then(m => m.RewardPointsPageModule)
  },
  {
    path: 'my-addresses',
    loadChildren: () => import('./my-addresses/my-addresses.module').then(m => m.MyAddressesPageModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./news/news.module').then(m => m.NewsPageModule)
  },
  {
    path: 'news-detail',
    loadChildren: () => import('./news-detail/news-detail.module').then(m => m.NewsDetailPageModule)
  },
  {
    path: 'intro',
    loadChildren: () => import('./intro/intro.module').then(m => m.IntroPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then(m => m.ContactUsPageModule)
  },
  {
    path: 'splash-screen',
    loadChildren: () => import('./splash-screen/splash-screen.module').then(m => m.SplashScreenPageModule)
  },
  {
    path: 'test',
    loadChildren: () => import('./test/test.module').then(m => m.TestPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: 'create-product',
    loadChildren: () => import('./settings/create-product/create-product.module').then(m => m.CreateProductPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
