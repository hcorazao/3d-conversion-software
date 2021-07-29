import { Injectable, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToggleSidebar, UpdateAllToolboxesSettings } from '@app/store/actions/settings.actions';
import { AllToolboxesSettings } from '@app/models/all-toolboxes-settings.model';
import { ToolboxSettings } from '@app/models/toolbox-settings.model';
import { Offset } from '@app/models/offset.model';
import { PANEL_MARGIN, SIDE_MARGIN, TOP_MARGIN, BOTTOM_MARGIN } from './utils/panels-positioner/constants';

@Injectable({
  providedIn: 'root',
})
export class ToolboxesSettingsUpdateHelperService {
  constructor(private store: Store) {}

  toggleMinimizationObjectsToolbox(value) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.caseObjectsToolboxSettings = ToolboxSettings.createWithMinimized(value);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  toggleMinimizationDevToolbox(value) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.devToolboxSettings = ToolboxSettings.createWithMinimized(value);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  toggleMinimizationToolsToolbox(value) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.toolsToolboxSettings = ToolboxSettings.createWithMinimized(value);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  toggleMinimizationCaseProgressStepper(value) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.cadAssistantToolboxSettings = ToolboxSettings.createWithMinimized(value);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  toggleCadAssistantTipsEnabled(value) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.cadAssistantToolboxSettings = ToolboxSettings.createWithTipsEnabled(value);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  saveNewDevToolboxPosition(mainElement: ElementRef<HTMLElement>, toolboxElement: ElementRef<HTMLElement>, dragOffset: Offset) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.devToolboxSettings = this.createToolboxSettingsWithOffsets(mainElement, toolboxElement, dragOffset);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  saveNewToolsToolboxPosition(mainElement: ElementRef<HTMLElement>, toolboxElement: ElementRef<HTMLElement>, dragOffset: Offset) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.toolsToolboxSettings = this.createToolboxSettingsWithOffsets(mainElement, toolboxElement, dragOffset);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  saveNewCaseObjectsToolboxPosition(mainElement: ElementRef<HTMLElement>, toolboxElement: ElementRef<HTMLElement>, dragOffset: Offset) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.caseObjectsToolboxSettings = this.createToolboxSettingsWithOffsets(mainElement, toolboxElement, dragOffset);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  saveNewCadAssistantToolboxPosition(mainElement: ElementRef<HTMLElement>, toolboxElement: ElementRef<HTMLElement>, dragOffset: Offset) {
    const allToolboxesSettings = new AllToolboxesSettings();
    allToolboxesSettings.cadAssistantToolboxSettings = this.createToolboxSettingsWithOffsets(mainElement, toolboxElement, dragOffset);
    this.store.dispatch(new UpdateAllToolboxesSettings({ allToolboxesSettings }));
  }

  private createToolboxSettingsWithOffsets(
    mainElement: ElementRef<HTMLElement>,
    toolboxElement: ElementRef<HTMLElement>,
    dragOffset: Offset
  ): ToolboxSettings {
    const mainWidth = mainElement.nativeElement.offsetWidth;
    const mainHeight = mainElement.nativeElement.offsetHeight;
    const offsetLeft = toolboxElement.nativeElement.offsetLeft;
    const offsetTop = toolboxElement.nativeElement.offsetTop;
    const width = toolboxElement.nativeElement.offsetWidth;
    const height = toolboxElement.nativeElement.offsetHeight;
    const leftHalf = offsetLeft + width / 2 + dragOffset.x < mainWidth / 2;
    const topHalf = offsetTop + height / 2 + dragOffset.y < mainHeight / 2;
    const newX = leftHalf
      ? Math.max(SIDE_MARGIN + PANEL_MARGIN, offsetLeft + dragOffset.x)
      : Math.max(SIDE_MARGIN + PANEL_MARGIN, mainWidth - (offsetLeft + dragOffset.x + width));
    const newY = topHalf
      ? Math.max(TOP_MARGIN + PANEL_MARGIN, offsetTop + dragOffset.y)
      : Math.max(BOTTOM_MARGIN + PANEL_MARGIN, mainHeight - (offsetTop + dragOffset.y + height));
    return ToolboxSettings.createWithOffsets(leftHalf, topHalf, newX, newY);
  }

  toggleSidebar() {
    this.store.dispatch(new ToggleSidebar());
  }
}
