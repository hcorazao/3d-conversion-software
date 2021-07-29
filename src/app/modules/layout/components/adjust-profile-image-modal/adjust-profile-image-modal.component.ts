import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { MatSliderChange } from '@angular/material/slider';
import { CropperPosition, ImageCroppedEvent } from 'ngx-image-cropper';
import { ButtonType } from '../button/button.component';
import { Store } from '@ngrx/store';
import { UpdateProfileDetails } from '@app/store/actions/settings.actions';
import { ProfileDetails } from '@app/models/profile-details.model';

@Component({
  selector: 'app-adjust-profile-image-modal',
  templateUrl: './adjust-profile-image-modal.component.html',
  styleUrls: ['./adjust-profile-image-modal.component.scss'],
})
export class AdjustProfileImageModalComponent implements OnInit {
  ButtonType = ButtonType;
  @ViewChild('profileImageWrapper', { static: true }) profileImageWrapperElement: ElementRef<HTMLElement>;

  @Input() profileImageFile: File;

  croppedImageBase64: string;
  maxCropperHeight = 0;
  maxCropperWidth = 0;
  maxCropperDiameter = 0;
  cropDiameter = 128;
  cropperPosition: CropperPosition = { x1: 0, y1: 0, x2: 256, y2: 256 };

  constructor(private store: Store, public dialogRef: MatDialogRef<ConfirmationModalComponent>) {}

  ngOnInit(): void {}

  valueChanged(change: MatSliderChange) {
    this.changeCropperPositionWithNewDiameter(change.value);
  }

  valueDragged(change: MatSliderChange) {
    this.changeCropperPositionWithNewDiameter(change.value);
  }

  private changeCropperPositionWithNewDiameter(diameter: number) {
    const newDiameter = Math.min(diameter, this.maxCropperDiameter);
    const deltaRadius = (newDiameter - this.cropDiameter) / 2;
    const x1 = Math.min(Math.max(this.cropperPosition.x1 - deltaRadius, 0), this.maxCropperWidth - newDiameter);
    const y1 = Math.min(Math.max(this.cropperPosition.y1 - deltaRadius, 0), this.maxCropperHeight - newDiameter);
    const x2 = x1 + newDiameter;
    const y2 = y1 + newDiameter;
    this.cropperPosition = { x1, y1, x2, y2 };
    this.cropDiameter = newDiameter;
  }

  cropperReady() {
    this.maxCropperHeight = this.profileImageWrapperElement.nativeElement.offsetHeight - 10;
    this.maxCropperWidth = this.profileImageWrapperElement.nativeElement.offsetWidth - 10;
    this.maxCropperDiameter = Math.min(this.maxCropperHeight, this.maxCropperWidth);
    this.cropDiameter = this.maxCropperDiameter;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBase64 = event.base64;
  }

  saveProfileImage() {
    const profileDetails = new ProfileDetails();
    profileDetails.profileImage = this.croppedImageBase64;
    this.store.dispatch(new UpdateProfileDetails({ profileDetails }));
    this.dialogRef.close();
  }
}
