import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductPricePage } from './product-price.page';

describe('ProductPricePage', () => {
  let component: ProductPricePage;
  let fixture: ComponentFixture<ProductPricePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductPricePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPricePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
