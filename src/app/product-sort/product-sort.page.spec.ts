import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductSortPage } from './product-sort.page';

describe('ProductSortPage', () => {
  let component: ProductSortPage;
  let fixture: ComponentFixture<ProductSortPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductSortPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSortPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
