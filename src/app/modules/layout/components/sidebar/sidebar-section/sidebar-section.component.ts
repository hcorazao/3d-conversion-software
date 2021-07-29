import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { DentalCaseSimple } from '@app/models/dental-case-simple.model';
import { PatientWithCases } from '@app/models/patient-with-cases.model';

@Component({
  selector: 'app-sidebar-section',
  templateUrl: './sidebar-section.component.html',
  styleUrls: ['./sidebar-section.component.scss'],
})
export class SidebarSectionComponent implements OnInit {
  @Input() expanded: boolean;
  @Input() loading: boolean;
  @Input() sectionTranslationsPrefix: string;
  @Input() cases: DentalCaseSimple[];
  @Input() patientsWithCases: PatientWithCases[];
  @Output() toggle = new EventEmitter();
  @Output() dentalCaseSelected = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
