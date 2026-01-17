import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  public visTabBar = false;
  public isLoginSucessFull = false;
  constructor() { }
  public setLogin(val) {
    console.log("i am in data service and setlogin=" + val)
    this.isLoginSucessFull = val;
  }
  public getLogin() {
    return this.isLoginSucessFull;
  }
  public setvisiableTabBar(val) {
    //console.log("i am in service and my tab valueis= "+val);
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
