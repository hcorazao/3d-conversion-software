import { Component, OnInit, HostListener, ElementRef, Input, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromSelectors from '@app/store/selectors';
import { Logout } from '@app/store/actions/auth.actions';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { UserModalComponent, UserModalTab, userModalConfig } from '../user-modal/user-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { ResetScene } from '@app/store/actions/babylon.actions';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { TogglePanelsVisibility } from '@app/store/actions/settings.actions';
import { takeUntil } from 'rxjs/operators';
import { ShortcutsModalComponent, shortcutsModalConfig } from '../shortcuts-modal/shortcuts-modal.component';
import { NewsModalComponent, newsModalConfig } from '../news-modal/news-modal.component';
import { AboutModalComponent, aboutModalConfig } from '../about-modal/about-modal.component';

@Component({
  selector: 'app-userbar',
  templateUrl: './userbar.component.html',
  styleUrls: ['./userbar.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('expanded', style({ height: '*', opacity: '1' })),
      state('collapsed', style({ height: 0, opacity: '0' })),

      transition('collapsed => expanded', [group([animate(200, style({ height: '*' })), animate(300, style({ opacity: '1' }))])]),
      transition('expanded => collapsed', [group([animate('0.2s 0.2s', style({ opacity: '0' })), animate(300, style({ height: 0 }))])]),
    ]),
  ],
})
export class UserBarComponent implements OnInit, OnDestroy {
  @Input() dentalCaseFolder: DentalCaseFolder;
  @Input() panelsVisible: boolean;

  private destroy$ = new Subject();
  userName$: Observable<string>;
  userInitials$: Observable<string>;
  userEmail$: Observable<string>;
  profileImage$: Observable<string>;
  userMenuOpen = false;
  sceneMenuOpen = false;
  supportMenuOpen = false;

  constructor(private store: Store, private elementRef: ElementRef, private dialog: MatDialog) {}

  @HostListener('document:click', ['$event'])
  documentClick(event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.userMenuOpen = false;
      this.sceneMenuOpen = false;
      this.supportMenuOpen = false;
    }
  }

  @HostListener('window:keydown.control.r', ['$event'])
  @HostListener('window:keydown.meta.r', ['$event'])
  resetSceneOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.resetScene();
  }

  @HostListener('window:keydown.control.p', ['$event'])
  @HostListener('window:keydown.meta.p', ['$event'])
  togglePanelsOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.togglePanelsVisibility();
  }

  ngOnInit(): void {
    this.userName$ = this.store.pipe(select(fromSelectors.getUserName), takeUntil(this.destroy$));
    this.userInitials$ = this.store.pipe(select(fromSelectors.getUserInitials), takeUntil(this.destroy$));
    this.userEmail$ = this.store.pipe(select(fromSelectors.getUserEmail), takeUntil(this.destroy$));
    this.profileImage$ = this.store.pipe(select(fromSelectors.getProfileImage), takeUntil(this.destroy$));
  }

  resetScene() {
    if (this.dentalCaseFolder) {
      this.store.dispatch(new ResetScene());
    }
  }

  togglePanelsVisibility() {
    this.store.dispatch(new TogglePanelsVisibility());
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    this.sceneMenuOpen = false;
    this.supportMenuOpen = false;
  }

  toggleSceneMenu() {
    this.userMenuOpen = false;
    this.sceneMenuOpen = !this.sceneMenuOpen;
    this.supportMenuOpen = false;
  }

  toggleSupportMenu() {
    this.userMenuOpen = false;
    this.sceneMenuOpen = false;
    this.supportMenuOpen = !this.supportMenuOpen;
  }

  openProfileDetails() {
    this.openUserModal(UserModalTab.userModalProfileDetailsTab);
  }

  openParameters() {
    this.openUserModal(UserModalTab.userModalDesignParametersTab);
  }

  openPreferences() {
    this.openUserModal(UserModalTab.userModalProfilePreferencesTab);
  }

  private openUserModal(selectedIndex) {
    this.userMenuOpen = false;
    const dialogRef = this.dialog.open(UserModalComponent, userModalConfig);
    dialogRef.componentInstance.selectedIndex = selectedIndex;
  }

  openShortcutsModal() {
    this.userMenuOpen = false;
    this.dialog.open(ShortcutsModalComponent, shortcutsModalConfig);
  }

  openNewsModal() {
    this.userMenuOpen = false;
    this.dialog.open(NewsModalComponent, newsModalConfig);
  }

  openAboutModal() {
    this.dialog.open(AboutModalComponent, aboutModalConfig);
  }

  logout() {
    this.store.dispatch(new Logout());
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
