import { Component, EventEmitter, Output, ChangeDetectorRef, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

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

  private storage = inject(Storage);

  constructor(
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
        const fileRef = ref(this.storage, filePath);
        const task = uploadBytesResumable(fileRef, file);

        task.on('state_changed', (snapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadPercent = percent;
          this.cdr.detectChanges();
        }, (error) => {
          console.error('Upload error', error);
          this.activeUploads--;
          if (this.activeUploads === 0) {
            this.isUploading = false;
            this.uploadPercent = 0;
          }
          this.cdr.detectChanges();
        }, () => {
          getDownloadURL(task.snapshot.ref).then(url => {
            this.imageUploaded.emit(url);
            this.activeUploads--;

            if (this.activeUploads === 0) {
              this.isUploading = false;
              this.uploadPercent = 0;
              event.target.value = '';
            }
            this.cdr.detectChanges();
          });
        });
      }
    }
  }
}
