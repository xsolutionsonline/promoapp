import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductSizePage } from './product-size.page';

describe('ProductSizePage', () => {
  let component: ProductSizePage;
  let fixture: ComponentFixture<ProductSizePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSizePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSizePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
