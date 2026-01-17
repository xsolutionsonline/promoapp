import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  public latest = false;
  public latestActive = true;
  public categories = true;
  public categoriesActive = false;
  public latestItems = [
    { img: "assets/images/news/2.jpg", date: "11-July-2019", name: "Shoes Trends 2019", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non neque ac tortor porta auctor. Mauris sed mi ornare, molestie dui ut, dignissim sem. Sed quis elit mauris. Aliquam bibendum dolor ex..." },
    { img: "assets/images/news/1.jpg", date: "11-July-2019", name: "Trending Business Shoes", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non neque ac tortor porta auctor. Mauris sed mi ornare, molestie dui ut, dignissim sem. Sed quis elit mauris. Aliquam bibendum dolor ex..." },
    { img: "assets/images/news/3.jpg", date: "11-July-2019", name: "Best Casual Combination", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non neque ac tortor porta auctor. Mauris sed mi ornare, molestie dui ut, dignissim sem. Sed quis elit mauris. Aliquam bibendum dolor ex..." },
  ];
  public categoryItems = [
    { img: "assets/images/news/4.jpg", name: "News", post: "5" },
    { img: "assets/images/news/5.jpg", name: "App Features", post: "5" },
    { img: "assets/images/news/6.jpg", name: "Promotions", post: "5" },
    { img: "assets/images/news/7.jpg", name: "Latest Articles", post: "5" },
  ]
  constructor() { }

  ngOnInit() {
  }
  segmentSelected(val) {
    if (val == "latest") {
      this.latest = false;
      this.latestActive = true;
      this.categories = true;
      this.categoriesActive = false;
    }
    else if (val == "latestActive") {
      this.latest = false;
      this.latestActive = true;
      this.categories = true;
      this.categoriesActive = false;
    }
    else if (val == "categories") {
      this.latest = true;
      this.latestActive = false;
      this.categories = false;
      this.categoriesActive = true;
    }
    else if (val == "categoriesActive") {
      this.latest = true;
      this.latestActive = false;
      this.categories = false;
      this.categoriesActive = true;
    }
  }
}
