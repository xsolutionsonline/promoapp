import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Events } from '../services/events.service';
import { DataServiceService } from '../services/data-service.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: false,
})
export class IntroPage implements OnInit {
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  public visBtn = true;
  public sliderItems = [
    { img: "assets/images/news/1.jpg", title: "Sign Up for Premium Tech at Unbeatable Prices", desc: "Access the latest innovations with exclusive discounts and the solid warranty you deserve", curve:"assets/images/other/curve-one.png" },
    { img: "assets/images/category/12.jpg", title: "Affordable Luxury. Total Security.", desc: "Elevate your wardrobe with curated pieces at prices you’ll love. Your data is always protected with our encrypted payment system.", curve:"assets/images/other/curve-two.png" },
    { img: "assets/images/category/11.jpg", title: "Knowledge is Gold. Invest in Yourself.", desc: "Elevate your career with top-tier digital assets. Secure payments and lifetime access to all your premium content.", curve:"assets/images/other/curve-three.png" },
  ];

  private currentIndex = 0;

  constructor(public service: DataServiceService,
    public events: Events) {
    // service.setvisiableTabBar(true);
    this.events.publish('tabActive', false);
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    // Optional: Implement autoplay if desired
  }

  onScroll(event: any) {
    const container = event.target;
    const scrollLeft = container.scrollLeft;
    const width = container.offsetWidth;

    // Calculate current index based on scroll position
    const index = Math.round(scrollLeft / width);

    if (this.currentIndex !== index) {
      this.currentIndex = index;
      if (this.currentIndex >= this.sliderItems.length - 1) {
        this.visBtn = false;
      } else {
        this.visBtn = true;
      }
    }
  }

  nextSlide() {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      const container = this.scrollContainer.nativeElement;
      const width = container.offsetWidth;
      const nextIndex = this.currentIndex + 1;

      if (nextIndex < this.sliderItems.length) {
        container.scrollTo({
          left: nextIndex * width,
          behavior: 'smooth'
        });
      }
    }
  }
}
