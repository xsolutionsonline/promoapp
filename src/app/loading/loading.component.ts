import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-overlay">
      <video
        [style.visibility]="isVideoLoaded ? 'visible' : 'hidden'"
        (loadeddata)="onVideoLoaded()"
        autoplay
        loop
        muted
        playsinline
        src="assets/videos/splash.mp4">
      </video>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    video {
      width: 56vmin;
      height: 56vmin;
      object-fit: cover;
      border-radius: 10px;
      visibility: hidden;
    }
  `]
})
export class LoadingComponent {
  isVideoLoaded = false;

  onVideoLoaded() {
    this.isVideoLoaded = true;
  }
}
