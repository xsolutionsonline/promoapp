import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false,
})
export class CategoriesPage implements OnInit {
  public expandCard: any = [];
  constructor() {
    this.expandCard = [
      {
        expandedHelp: false, name: "Technology", img: "assets/images/category/category_ppal.jpg", id: 0,
        visIconZero: true,
        visIconOne: false,
        visIconTwo: false,
        subcategories: [
          { name: "Headphones", img: "assets/images/category/headphones.jpg" },
          { name: "Smart Home", img: "assets/images/category/Smart Home.jpg" },
          { name: "Wearables", img: "assets/images/category/Wearables.jpg" }
        ]
      },
      {
        expandedHelp: false, name: "Pets", img: "assets/images/category/pets_ppal.jpg", id: 1,
        visIconZero: false,
        visIconOne: true,
        visIconTwo: false,
        subcategories: [

        ]
      },
      {
        expandedHelp: false, name: "Info Products", img: "assets/images/category/infoproduct_ppal.jpg", id: 2,
        visIconZero: false,
        visIconOne: false,
        visIconTwo: true,
        subcategories: [

        ]
      }
    ];
  }

  ngOnInit() {
  }
  //expand card function
  expandCardFun(item): void {
    console.log(item.id);
    const rightIconZero = document.getElementById('right-icon-0');
    const rightIconOne = document.getElementById('right-icon-1');
    const rightIconTwo = document.getElementById('right-icon-2');

    if (item.id == 0) {
      if (rightIconZero.style.transform == '') {
        rightIconZero.style.transition = 'width 1s, height 1s, transform 1s';
        rightIconZero.style.transform = 'rotate(90deg)';
        console.log("null condition for icon");
      }
      else if (rightIconZero.style.transform == 'rotate(90deg)') {
        rightIconZero.style.transition = 'width 1s, height 1s, transform 1s';
        rightIconZero.style.transform = 'rotate(0deg)';
        rightIconOne.style.transform = 'rotate(0deg)';
        rightIconTwo.style.transform = 'rotate(0deg)';
        console.log("rotate(90deg) condition for icon");
      }
      else if (rightIconZero.style.transform == 'rotate(0deg)') {
        rightIconZero.style.transition = 'width 1s, height 1s, transform 1s';
        rightIconZero.style.transform = 'rotate(90deg)';
        rightIconOne.style.transform = 'rotate(0deg)';
        rightIconTwo.style.transform = 'rotate(0deg)';
        console.log("rotate(0deg) condition for icon");
      }
    }
    else if (item.id == 1) {
      if (rightIconOne.style.transform == '') {
        rightIconOne.style.transition = 'width 2s, height 2s, transform 2s';
        rightIconOne.style.transform = 'rotate(90deg)';
        console.log("null condition for icon");
      }
      else if (rightIconOne.style.transform == 'rotate(90deg)') {
        rightIconOne.style.transition = 'width 2s, height 2s, transform 2s';
        rightIconOne.style.transform = 'rotate(0deg)';
        rightIconZero.style.transform = 'rotate(0deg)';
        rightIconOne.style.transform = 'rotate(0deg)';
        console.log("rotate(90deg) condition for icon");
      }
      else if (rightIconOne.style.transform == 'rotate(0deg)') {
        rightIconOne.style.transition = 'width 2s, height 2s, transform 2s';
        rightIconOne.style.transform = 'rotate(90deg)';
        rightIconZero.style.transform = 'rotate(0deg)';
        rightIconTwo.style.transform = 'rotate(0deg)';
        console.log("rotate(0deg) condition for icon");
      }
    }
    else if (item.id == 2) {
      if (rightIconTwo.style.transform == '') {
        rightIconTwo.style.transition = 'width 2s, height 2s, transform 2s';
        rightIconTwo.style.transform = 'rotate(90deg)';
        console.log("null condition for icon");
      }
      else if (rightIconTwo.style.transform == 'rotate(90deg)') {
        rightIconTwo.style.transition = 'width 2s, height 2s, transform 2s';
        rightIconTwo.style.transform = 'rotate(0deg)';
        rightIconZero.style.transform = 'rotate(0deg)';
        rightIconOne.style.transform = 'rotate(0deg)';
        console.log("rotate(90deg) condition for icon");
      }
      else if (rightIconTwo.style.transform == 'rotate(0deg)') {
        rightIconTwo.style.transition = 'width 2s, height 2s, transform 2s';
        rightIconTwo.style.transform = 'rotate(90deg)';
        rightIconZero.style.transform = 'rotate(0deg)';
        rightIconOne.style.transform = 'rotate(0deg)';
        console.log("rotate(0deg) condition for icon");
      }
    }
    if (item.expandedHelp) {
      item.expandedHelp = false;
      console.log("item.expandedHelp = false");
    }
    else {
      this.expandCard.map(listItem => {
        if (item == listItem) {
          listItem.expanded = !listItem.expanded;
          console.log("if");
        }
        else {
          console.log("else");
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }
}
