import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-item-expand-component',
  templateUrl: './item-expand-component.component.html',
  styleUrls: ['./item-expand-component.component.scss'],
  standalone: true,
})
export class ItemExpandComponentComponent implements AfterViewInit {
  @ViewChild("expandWrapper", { read: ElementRef, static: false }) private expandWrapper: ElementRef;
  @Input() expanded: boolean = false;
  @Input() expandHeight: string = "150px";
  constructor(public renderer: Renderer2) { }
  ngAfterViewInit() {
    this.renderer.setStyle(this.expandWrapper.nativeElement, "max-height", this.expandHeight);
  }
}
