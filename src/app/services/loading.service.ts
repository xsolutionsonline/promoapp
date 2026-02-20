import { Injectable, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingComponentRef: ComponentRef<LoadingComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  show() {
    if (this.loadingComponentRef) {
      return;
    }
    const factory = this.componentFactoryResolver.resolveComponentFactory(LoadingComponent);
    this.loadingComponentRef = factory.create(this.injector);
    this.appRef.attachView(this.loadingComponentRef.hostView);
    const domElem = (this.loadingComponentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  hide() {
    if (this.loadingComponentRef) {
      this.appRef.detachView(this.loadingComponentRef.hostView);
      this.loadingComponentRef.destroy();
      this.loadingComponentRef = null;
    }
  }
}
