import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { Events } from '../services/events.service';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-forget',
  templateUrl: './forget.page.html',
  styleUrls: ['./forget.page.scss'],
  standalone: false,
})
export class ForgetPage implements OnInit {
  //for blur effect
  public visiablePopup = false;
  public divBlur = ""
  public email = "";
  public resetBtn = true;
  constructor(public events: Events,
    private elementRef: ElementRef,
    private auth: Auth,
    private router: Router) {
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
    });
  }
  forgetPass() {
    if (this.email != "") {
      this.resetBtn = false;
    }
    else {
      this.resetBtn = true;
    }
  }
  async isforgetPassword() {
    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.divBlur = "blur(6px)"
      this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
      this.visiablePopup = true;//for blur effect
    } catch (error) {
      console.error('Error sending password reset email', error);
      // Handle error (e.g., show a toast message)
    }
  }
  ionViewWillEnter() {
    //value of blue from home modal
    this.events.subscribe('blurValue', (data) => {
      this.divBlur = data;
    });
    this.visiablePopup = false;//for blur effect
    this.elementRef.nativeElement.style.setProperty('--my-var', this.divBlur);
  }
  dismiss() {
    this.events.publish('blurValue', "blur(0px)");
    this.visiablePopup = false;//for disable blur effect
    this.router.navigate(['/home']);
  }
  ngOnInit() {
  }

}
