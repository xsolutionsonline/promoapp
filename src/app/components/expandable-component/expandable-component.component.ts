import { Component, OnInit, ViewChild, ElementRef, Input, Renderer2, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-expandable-component',
  templateUrl: './expandable-component.component.html',
  styleUrls: ['./expandable-component.component.scss'],
  standalone: false,
})
export class ExpandableComponentComponent implements AfterViewInit {
  @ViewChild("expandWrapper", { read: ElementRef, static: false }) private expandWrapper: ElementRef;
  @Input() expanded: boolean = false;
  @Input() expandHeight: string = "150px";

  constructor(public renderer: Renderer2) { }

  ngAfterViewInit() {
    this.renderer.setStyle(this.expandWrapper.nativeElement, "max-height", this.expandHeight);
  }
}
