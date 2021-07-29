import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { Store } from '@ngrx/store';
import { PrepareResultExport, RestartCase, SearchPatientDentalCases } from '@app/store/actions/babylon.actions';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('expanded', style({ height: '*', opacity: '1' })),
      state('collapsed', style({ height: 0, opacity: '0' })),

      transition('collapsed => expanded', [group([animate(200, style({ height: '*' })), animate(300, style({ opacity: '1' }))])]),
      transition('expanded => collapsed', [group([animate('0.2s 0.2s', style({ opacity: '0' })), animate(300, style({ height: 0 }))])]),
    ]),
  ],
})
export class TopBarComponent implements OnInit {
  @Input() dentalCaseFolder: DentalCaseFolder;
  @Input() toggledSidebar: boolean;
  @Output() toggleSidebar = new EventEmitter();

  exportPanelOpen = false;
  caseInfoTooltipOpen = false;

  constructor(private store: Store, private elementRef: ElementRef) {}

  ngOnInit(): void {}

  @HostListener('document:click', ['$event'])
  documentClick(event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.exportPanelOpen = false;
    }
  }

  @HostListener('window:keydown.control.e', ['$event'])
  @HostListener('window:keydown.meta.e', ['$event'])
  toggleExportPanelOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    if (this.dentalCaseFolder) {
      this.toggleExportPanel();
    }
  }

  @HostListener('window:keydown.control.d', ['$event'])
  @HostListener('window:keydown.meta.d', ['$event'])
  toggleCaseInfoOnKeyShortcut(event: KeyboardEvent) {
    event.preventDefault();
    this.toggleCaseInfoTooltip();
  }

  toggleCaseInfoTooltip() {
    this.caseInfoTooltipOpen = !this.caseInfoTooltipOpen;
  }

  searchPatientDentalCases() {
    this.store.dispatch(new SearchPatientDentalCases({ patient: this.dentalCaseFolder.patient }));
  }

  toggleExportPanel() {
    this.exportPanelOpen = !this.exportPanelOpen;
  }

  exportCase() {
    this.store.dispatch(new PrepareResultExport());
  }

  closeCase() {
    this.store.dispatch(new RestartCase({ caseFolderImportComponentVisible: true }));
    this.toggleExportPanel();
  }
}
