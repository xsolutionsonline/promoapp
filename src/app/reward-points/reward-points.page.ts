import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-reward-points',
  templateUrl: './reward-points.page.html',
  styleUrls: ['./reward-points.page.scss'],
})
export class RewardPointsPage implements OnInit {
  public rewardCards = [
    { title: "Reward Points", action: "account-signup", points: "5", date: "July 30, 2019" },
    { title: "Reward Points", action: "Order Placed", points: "5", date: "July 30, 2019" }
  ]
  constructor() { }

  ngOnInit() {
  }

}
