import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-item-expand-component',
  templateUrl: './item-expand-component.component.html',
  styleUrls: ['./item-expand-component.component.scss'],
})
export class ItemExpandComponentComponent {
  @ViewChild("expandWrapper", { read: ElementRef, static: false }) private expandWrapper: ElementRef;
  @Input("expanded") expanded: boolean = false;
  @Input("expandHeight") expandHeight: string = "150px";
  constructor(public renderer: Renderer2) { }
  ngAfterViewInit() {
    this.renderer.setStyle(this.expandWrapper.nativeElement, "max-height", this.expandHeight);
  }
}
