import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductColorPage } from './product-color.page';

describe('ProductColorPage', () => {
  let component: ProductColorPage;
  let fixture: ComponentFixture<ProductColorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductColorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductColorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
