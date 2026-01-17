import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BlankModalPage } from './blank-modal.page';

describe('BlankModalPage', () => {
  let component: BlankModalPage;
  let fixture: ComponentFixture<BlankModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlankModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BlankModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
