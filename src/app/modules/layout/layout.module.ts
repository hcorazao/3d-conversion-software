import { SharedModule } from '@app/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AngularDraggableModule } from 'angular2-draggable';
import { ImageCropperModule } from 'ngx-image-cropper';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { NavigationMainButtonComponent } from './components/navigation-main-button/navigation-main-button.component';
import { UserBarComponent } from './components/userbar/userbar.component';
import { CaseFolderDropzoneInfoboxComponent } from './components/case-folder-dropzone-infobox/case-folder-dropzone-infobox.component';
import { UserModalComponent } from './components/user-modal/user-modal.component';
import { ProfileDetailsComponent } from './components/user-modal/profile-details/profile-details.component';
import { DesignParametersComponent } from './components/user-modal/design-parameters/design-parameters.component';
import { UserPreferencesComponent } from './components/user-modal/user-preferences/user-preferences.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CaseProgressStepperComponent } from './components/case-progress-stepper/case-progress-stepper.component';
import { CaseProgressStepComponent } from './components/case-progress-stepper/case-progress-step/case-progress-step.component';
import { ObjectsToolboxComponent } from './components/objects-toolbox/objects-toolbox.component';
import { ObjectSliderComponent } from './components/toolbox/toolbox-slider/toolbox-slider.component';
import { TopBarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { SidebarSectionComponent } from './components/sidebar/sidebar-section/sidebar-section.component';
import { DevToolboxComponent } from './components/dev-toolbox/dev-toolbox.component';
import { ToolboxComponent } from './components/toolbox/toolbox.component';
import { DeleteAccountModalComponent } from './components/delete-account-modal/delete-account-modal.component';
import { CaseDetailsCardComponent } from './components/case-details-card/case-details-card.component';
import { CaseDetailLineComponent } from './components/case-details-card/case-detail-line/case-detail-line.component';
import { CaseProgressStepsComponent } from './components/case-progress-stepper/case-progress-steps/case-progress-steps.component';
import { ToolsToolboxComponent } from './components/tools-toolbox/tools-toolbox.component';
import { ToastNotificationComponent } from './components/notifications/toast-notification/toast-notification.component';
import { ActionNotificationComponent } from './components/notifications/action-notification/action-notification.component';
import { UploadNotificationComponent } from './components/notifications/upload-notification/upload-notification.component';
import { FreshCasesNotificationComponent } from './components/notifications/fresh-cases-notification/fresh-cases-notification.component';
import { ButtonComponent } from './components/button/button.component';
import { AdjustProfileImageModalComponent } from './components/adjust-profile-image-modal/adjust-profile-image-modal.component';
import { AutoClosingButtonComponent } from './components/notifications/auto-closing-button/auto-closing-button.component';
import { PatientSidebarSectionComponent } from './components/sidebar/patient-sidebar-section/patient-sidebar-section.component';
import { DentalCaseComponent } from './components/sidebar/dental-case/dental-case.component';
import { ShortcutsModalComponent } from './components/shortcuts-modal/shortcuts-modal.component';
import { KeyboardShortcutDescriptionComponent } from './components/shortcuts-modal/keyboard-shortcut-description/keyboard-shortcut-description.component';
import { NewsModalComponent } from './components/news-modal/news-modal.component';
import { AboutModalComponent } from './components/about-modal/about-modal.component';
import { UserGreetingComponent } from './components/user-modal/user-greeting/user-greeting.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    LayoutComponent,
    NavigationMainButtonComponent,
    UserBarComponent,
    CaseFolderDropzoneInfoboxComponent,
    UserModalComponent,
    ProfileDetailsComponent,
    DesignParametersComponent,
    UserPreferencesComponent,
    CaseProgressStepperComponent,
    CaseProgressStepComponent,
    ObjectsToolboxComponent,
    ObjectSliderComponent,
    TopBarComponent,
    SidebarComponent,
    ConfirmationModalComponent,
    SidebarSectionComponent,
    DevToolboxComponent,
    ToolboxComponent,
    DeleteAccountModalComponent,
    CaseDetailsCardComponent,
    CaseDetailLineComponent,
    CaseProgressStepsComponent,
    ToolsToolboxComponent,
    ToastNotificationComponent,
    ActionNotificationComponent,
    UploadNotificationComponent,
    FreshCasesNotificationComponent,
    ButtonComponent,
    AdjustProfileImageModalComponent,
    AutoClosingButtonComponent,
    PatientSidebarSectionComponent,
    DentalCaseComponent,
    ShortcutsModalComponent,
    KeyboardShortcutDescriptionComponent,
    NewsModalComponent,
    AboutModalComponent,
    UserGreetingComponent,
  ],
  imports: [
    TranslateModule.forChild({
      extend: true,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    CommonModule,
    LayoutRoutingModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatStepperModule,
    MatSliderModule,
    MatProgressBarModule,
    MatTooltipModule,
    SharedModule,
    FormsModule,
    AngularDraggableModule,
    ImageCropperModule,
  ],
  entryComponents: [UserModalComponent, ConfirmationModalComponent, DeleteAccountModalComponent, AdjustProfileImageModalComponent],
})
export class LayoutModule {}
