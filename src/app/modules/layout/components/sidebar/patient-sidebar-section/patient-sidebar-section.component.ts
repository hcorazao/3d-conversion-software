import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Patient } from '@app/models/patient.model';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { AddToastNotificationByType } from '@app/store/actions/notifications.actions';
import { ToastNotificationType } from '@app/models/enums/toast-notification-type.enum';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-patient-sidebar-section',
  templateUrl: './patient-sidebar-section.component.html',
  styleUrls: ['./patient-sidebar-section.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('expanded', style({ height: '*', opacity: '1' })),
      state('collapsed', style({ height: 0, opacity: 0 })),

      transition('collapsed => expanded', [group([animate(200, style({ height: '*', opacity: '1' }))])]),
      transition('expanded => collapsed', [group([animate(200, style({ opacity: 0, height: 0 }))])]),
    ]),
  ],
})
export class PatientSidebarSectionComponent {
  @Input() patient: Patient;
  @Input() cases: DentalCaseFolder[];
  @Output() dentalCaseSelected = new EventEmitter<string>();

  expanded = false;
  patientIdCopierHover = false;

  constructor(private store: Store) {}

  onToggleExpander(): void {
    this.expanded = !this.expanded;
  }

  copyPatientId(event: MouseEvent): boolean {
    navigator.clipboard.writeText(this.patient.id);
    this.store.dispatch(new AddToastNotificationByType({ type: ToastNotificationType.SIDEBAR_PATIENT_ID_COPIED_SUCCESSFULLY }));

    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  handleDentalCaseSelected(name: string): void {
    this.dentalCaseSelected.emit(name);
  }
}
