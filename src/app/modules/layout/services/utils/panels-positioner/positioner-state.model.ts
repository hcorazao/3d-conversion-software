import { Panel } from './panel.model';
import { SIDE_MARGIN, TOP_MARGIN, BOTTOM_MARGIN } from './constants';
import { ElementRef } from '@angular/core';
import { ToolboxesWithSettings } from '@app/models/toolbox-with-settings.model';

const STYLE_ATTRIBUTE = 'style';

export type ScreenSizes = { width: number; height: number };

export class PositionerState {
  changed: boolean;
  screen: ScreenSizes;
  devPanel: Panel;
  toolsPanel: Panel;
  caseObjectsPanel: Panel;
  cadAssistantPanel: Panel;
  panelsRepositioning: boolean;

  static createFromMainElementAndPanels(
    mainElement: ElementRef<HTMLElement>,
    panels: ToolboxesWithSettings,
    panelsRepositioning: boolean,
    previousState: PositionerState
  ): PositionerState {
    const result = new PositionerState();
    result.screen = {
      height: mainElement.nativeElement.offsetHeight - TOP_MARGIN - BOTTOM_MARGIN,
      width: mainElement.nativeElement.offsetWidth - 2 * SIDE_MARGIN,
    };
    result.devPanel = Panel.create(1, panels.devToolbox, previousState?.devPanel);
    result.toolsPanel = Panel.create(2, panels.toolsToolbox, previousState?.toolsPanel);
    result.caseObjectsPanel = Panel.create(3, panels.caseObjectsToolbox, previousState?.caseObjectsPanel);
    result.cadAssistantPanel = Panel.create(4, panels.cadAssistantToolbox, previousState?.cadAssistantPanel);
    result.panelsRepositioning = panelsRepositioning;
    result.changed =
      !previousState ||
      result.screen.height !== previousState.screen.height ||
      result.screen.width !== previousState.screen.width ||
      (result.devPanel.element && result.devPanel.changed) ||
      (result.toolsPanel.element && result.toolsPanel.changed) ||
      (result.caseObjectsPanel.element && result.caseObjectsPanel.changed) ||
      (result.cadAssistantPanel.element && result.cadAssistantPanel.changed) ||
      result.panelsRepositioning !== previousState.panelsRepositioning;
    return result;
  }

  displayChange(previousState: PositionerState) {
    console.log(`Positioner state changed`);
    if (!previousState) {
      console.log(`  previous state was empty`);
      return;
    }
    if (this.screen.height !== previousState.screen.height) {
      console.log(`  screen height changed (${previousState.screen.height} -> ${this.screen.height})`);
    }
    if (this.screen.width !== previousState.screen.width) {
      console.log(`  screen width changed (${previousState.screen.width} -> ${this.screen.width})`);
    }
    if (this.panelsRepositioning !== previousState.panelsRepositioning) {
      console.log(`  panelsRepositioning changed (${previousState.panelsRepositioning} -> ${this.panelsRepositioning})`);
    }
    if (this.devPanel.element && this.devPanel.changed) {
      console.log(`  devPanel changed (${this.devPanel.getChange(previousState.devPanel)})`);
    }
    if (this.toolsPanel.element && this.toolsPanel.changed) {
      console.log(`  toolsPanel changed (${this.toolsPanel.getChange(previousState.toolsPanel)})`);
    }
    if (this.caseObjectsPanel.element && this.caseObjectsPanel.changed) {
      console.log(`  caseObjectsPanel changed (${this.caseObjectsPanel.getChange(previousState.caseObjectsPanel)})`);
    }
    if (this.cadAssistantPanel.element && this.cadAssistantPanel.changed) {
      console.log(`  cadAssistantPanel changed (${this.cadAssistantPanel.getChange(previousState.cadAssistantPanel)})`);
    }
  }

  styleAll() {
    this.stylePanelIfExists(this.devPanel);
    this.stylePanelIfExists(this.toolsPanel);
    this.stylePanelIfExists(this.caseObjectsPanel);
    this.stylePanelIfExists(this.cadAssistantPanel);
  }

  private stylePanelIfExists(panel: Panel) {
    if (panel && panel.element) {
      panel.element.setAttribute(STYLE_ATTRIBUTE, panel.getStyle());
    }
  }
}
