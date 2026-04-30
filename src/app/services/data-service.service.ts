import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  public visTabBar = false;
  public isLoginSucessFull = false;
  private userData: any = null;

  constructor() {
    this.isLoginSucessFull = JSON.parse(localStorage.getItem('isLoginSucessFull') || 'false');
    this.userData = JSON.parse(localStorage.getItem('userData') || 'null');
  }

  public setLogin(val: boolean) {
    console.log("i am in data service and setlogin=" + val)
    this.isLoginSucessFull = val;
    localStorage.setItem('isLoginSucessFull', JSON.stringify(val));
  }

  public getLogin() {
    return this.isLoginSucessFull;
  }

  public setUserData(data: any) {
    this.userData = data;
    localStorage.setItem('userData', JSON.stringify(data));
  }

  public getUserData() {
    return this.userData;
  }

  public setvisiableTabBar(val: boolean) {
    if (val == true) {
      this.visTabBar = true;
    }
    else if (val == false){
      this.visTabBar = false;
    }
  }

  public getvisiableTabBar() {
    return this.visTabBar;
  }
}
