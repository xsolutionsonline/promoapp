import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from '@angular/core';
import { SplashScreenPage } from '../splash-screen/splash-screen.page';

@Injectable({
  providedIn: 'root'
})
export class SplashScreenService {
  private splashScreenComponentRef: ComponentRef<SplashScreenPage>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  show() {
    if (this.splashScreenComponentRef) {
      return;
    }
    const factory = this.componentFactoryResolver.resolveComponentFactory(SplashScreenPage);
    this.splashScreenComponentRef = factory.create(this.injector);
    this.appRef.attachView(this.splashScreenComponentRef.hostView);
    const domElem = (this.splashScreenComponentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  hide() {
    if (this.splashScreenComponentRef) {
      this.appRef.detachView(this.splashScreenComponentRef.hostView);
      this.splashScreenComponentRef.destroy();
      this.splashScreenComponentRef = null;
    }
  }
}
