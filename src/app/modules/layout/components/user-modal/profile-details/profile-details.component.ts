import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ButtonType } from '../../button/button.component';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { Observable, Subject } from 'rxjs';
import { ProfileDetails } from '@app/models/profile-details.model';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { RemoveProfileImage } from '@app/store/actions/settings.actions';
import { takeUntil } from 'rxjs/operators';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const MAX_ACCEPTED_IMAGE_BYTES_SIZE = 10 * 1024 * 1024;

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('expanded', style({ height: '*', opacity: '1', marginTop: '28px', marginBottom: '0' })),
      state('collapsed', style({ height: 0, opacity: '0', marginTop: '0', marginBottom: 0 })),

      transition('collapsed => expanded', [
        group([animate(200, style({ height: '*', marginTop: '28px', marginBottom: '0' })), animate(300, style({ opacity: '1' }))]),
      ]),
      transition('expanded => collapsed', [
        group([animate('0.2s 0.2s', style({ opacity: '0' })), animate(300, style({ height: 0, marginTop: 0, marginBottom: 0 }))]),
      ]),
    ]),
  ],
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  ButtonType = ButtonType;

  @Output() openDeleteAccountModal = new EventEmitter();
  @Output() openAdjustProfileImageModal = new EventEmitter<File>();

  private destroy$ = new Subject();
  userName$: Observable<string>;
  profileDetails$: Observable<ProfileDetails>;
  changingEmail = false;
  changingPassword = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.profileDetails$ = this.store.pipe(select(fromSelectors.getProfileDetails), takeUntil(this.destroy$));
    this.userName$ = this.store.pipe(select(fromSelectors.getUserName), takeUntil(this.destroy$));
  }

  onDeleteAccount() {
    this.openDeleteAccountModal.emit();
  }

  chooseProfileImage(event) {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : undefined;
    if (file && ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_ACCEPTED_IMAGE_BYTES_SIZE) {
      this.openAdjustProfileImageModal.emit(file);
    } else {
      console.error('wrong profile image file');
    }
  }

  getInitials(userName: string): string {
    if (!userName) {
      return '';
    }
    return userName.split(' ').reduce((x, y) => (x += y[0]), '');
  }

  removeProfileImage() {
    this.store.dispatch(new RemoveProfileImage());
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
