import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { ModalController, Events, ToastController } from '@ionic/angular';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
})
export class ReviewPage implements OnInit {
  public raingNum = "0.00";
  public starNum = 0;
  public visCard = false;
  //for blur effect
  public visiablePopup = false;
  public divBlur = ""
  public name = "";
  public email = "";
  public message = "";
  public visReview = false;
  public reviewRows = [
    { num: "5", background: "#9CC068", width: "85%" },
    { num: "4", background: "#A9D652", width: "25%" },
    { num: "3", background: "#FED756", width: "35%" },
    { num: "2", background: "#FCB14C", width: "50%" },
    { num: "1", background: "#FB8A62", width: "10%" },
  ];
  public reviewCards = [
    {
      img: "assets/images/other/face-images/1.png", name: "Username", date: "2019-08-28",
      paraDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non neque ac tortor porta auctor. Mauris sed mi ornare, molestie dui ut, dignissim sem. Sed quis elit mauris. Aliquam bibendum dolor ex, ut eleifend erat sollicitudin et."
    },
    {
      img: "assets/images/other/face-images/2.png", name: "Username", date: "2019-08-28",
      paraDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non neque ac tortor porta auctor. Mauris sed mi ornare, molestie dui ut, dignissim sem. Sed quis elit mauris. Aliquam bibendum dolor ex, ut eleifend erat sollicitudin et."
    },
    {
      img: "assets/images/other/face-images/3.png", name: "Username", date: "2019-08-28",
      paraDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non neque ac tortor porta auctor. Mauris sed mi ornare, molestie dui ut, dignissim sem. Sed quis elit mauris. Aliquam bibendum dolor ex, ut eleifend erat sollicitudin et."
    },
  ]
  constructor(private modalCtrl: ModalController,
    public events: Events, private elementRef: ElementRef,
    private toastController: ToastController) {
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }
  ionViewWillEnter() {
    //value of blue from home modal
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
    });
    this.visiablePopup = false;//for blur effect
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    this.visCard = false;
    this.raingNum = "0.00";
    this.starNum = 0;
  }
  ngOnInit() {
  }
  goToreviewMessage() {
    this.divBlur = "blur(6px)"
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    this.visiablePopup = true;//for blur effect
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;//for disable blur effect
  }
  async goBack() {
    if (this.name != "" && this.email != "" && this.message != "") {
      this.visCard = true;
      this.events.publish('blurValue', "blur(0px)");

      this.visiablePopup = false;//for disable blur effect
      this.raingNum = "4.00";
      this.starNum = 5;
    }
    else {
      //toast controller
      const toast = await this.toastController.create({
        message: 'Please fill all fields',
        color: "danger",
        duration: 2000
      });
      toast.present();
    }
  }
}
