import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RewardPointsPage } from './reward-points.page';

describe('RewardPointsPage', () => {
  let component: RewardPointsPage;
  let fixture: ComponentFixture<RewardPointsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RewardPointsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RewardPointsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
