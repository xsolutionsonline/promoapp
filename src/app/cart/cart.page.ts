import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage implements OnInit {
  displayItems = "Items"
  visCartEmpty = false;
  count = 2;
  productQuantity = 1;
  productPrice = 90;
  public cartItemsCount = 2;
  public cartItems = [
    {
      img: "assets/images/shoes/sale/1.png", name: "Product Title Will Be Go Here! Product Title", quantity: "1", price: "90", bgRadius: "solid 8px black", color: "black", size: "S", id: 0, visCard: true, visDeleteItem: true,
      subItemsColor: [
        { color: "#1C197A", bgRadius: "8px solid #1C197A", text: "Blue", selectSize: false },
        { color: "#5A197A", bgRadius: "8px solid #5A197A", text: "Purple", selectSize: true },
        { color: "#913523", bgRadius: "8px solid #913523", text: "Brown", selectSize: false },
        { color: "#7A6719", bgRadius: "8px solid #7A6719", text: "Camel", selectSize: false },
      ],
      subItemsSize: [
        { name: "S", text: "Small", selectSize: true },
        { name: "M", text: "Medium", selectSize: false },
        { name: "L", text: "Large", selectSize: false },
        { name: "XL", text: "Xtra Large", selectSize: false },
      ]
    },
    {
      img: "assets/images/shoes/new/3.png", name: "Product Title Will Be Go Here! Product Title", quantity: "1", price: "90", bgRadius: "solid 8px #334457", color: "#334457", size: "S", id: 1, visCard: true, visDeleteItem: true,
      subItemsColor: [
        { color: "#1C197A", bgRadius: "8px solid #1C197A", text: "Blue", selectSize: true },
        { color: "#5A197A", bgRadius: "8px solid #5A197A", text: "Purple", selectSize: false },
        { color: "#913523", bgRadius: "8px solid #913523", text: "Brown", selectSize: false },
        { color: "#7A6719", bgRadius: "8px solid #7A6719", text: "Camel", selectSize: false },
      ],
      subItemsSize: [
        { name: "S", text: "Small", selectSize: false },
        { name: "M", text: "Medium", selectSize: true },
        { name: "L", text: "Large", selectSize: false },
        { name: "XL", text: "Xtra Large", selectSize: false },
      ]
    },
  ];
  constructor() { }

  ngOnInit() {
  }
  public editProduct(item) {
    if (item.id == 0) {
      item.visCard = false;
    }
    else if (item.id == 1) {
      item.visCard = false;
    }
  }
  //for color
  isColorCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = true;
    }
    else {
      item.selectSize = true;
    }
  }
  isSelectedColorCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = false;
    }
    else {
      item.selectSize = true;
    }
  }
  //for size
  isSizeCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = true;
    }
    else {
      item.selectSize = true;
    }
  }
  isSelectSizeCheck(item) {
    if (item.selectSize == true) {
      item.selectSize = false;
    }
    else {
      item.selectSize = true;
    }
  }
  addBtn() {
    this.productQuantity = this.productQuantity + 1;
    this.productPrice = this.productPrice + 90;
  }
  subBtn() {
    this.productQuantity = this.productQuantity - 1;
    this.productPrice = this.productPrice - 90;
    if (this.productQuantity < 1) {
      this.productQuantity = 1;
      this.productPrice = 90;
    }
  }
  cancel(item) {
    if (item.id == 0) {
      item.visCard = true;
    }
    else if (item.id == 1) {
      item.visCard = true;
    }
  }
  update(item) {
    if (item.id == 0) {
      item.visCard = true;
    }
    else if (item.id == 1) {
      item.visCard = true;
    }
  }
  deleteItem(item) {
    if (item.id == 0) {
      item.visDeleteItem = false;
      this.count = this.count - 1;
      this.cartItemsCount = this.cartItemsCount - 1;
    }
    else if (item.id == 1) {
      item.visDeleteItem = false;
      this.count = this.count - 1;
      this.cartItemsCount = this.cartItemsCount - 1;
    }
    if (this, this.count == 1) {
      this.displayItems = "Item"
    }
    if (this.count == 0) {
      this.visCartEmpty = true;
      this.displayItems = "Item"

    }
  }
}
