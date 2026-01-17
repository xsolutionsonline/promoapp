import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeModelPage } from './home-model.page';

describe('HomeModelPage', () => {
  let component: HomeModelPage;
  let fixture: ComponentFixture<HomeModelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeModelPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeModelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
