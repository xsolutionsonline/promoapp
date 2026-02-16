import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  standalone: false
})
export class ImageUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();
  uploadPercent: number = 0;
  isUploading: boolean = false;
  private activeUploads: number = 0;

  constructor(
    private storage: AngularFireStorage,
    private cdr: ChangeDetectorRef
  ) {}

  uploadFile(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.activeUploads += files.length;
      this.isUploading = true;
      this.cdr.detectChanges();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `product-images/${new Date().getTime()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        // Update progress bar
        task.percentageChanges().subscribe(percent => {
          if (percent) {
            this.uploadPercent = percent;
            this.cdr.detectChanges();
          }
        });

        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              this.imageUploaded.emit(url);
              this.activeUploads--;

              if (this.activeUploads === 0) {
                this.isUploading = false;
                this.uploadPercent = 0;
                // Reset file input value so the same file can be selected again if needed
                event.target.value = '';
              }
              this.cdr.detectChanges();
            });
          })
        ).subscribe();
      }
    }
  }
}
