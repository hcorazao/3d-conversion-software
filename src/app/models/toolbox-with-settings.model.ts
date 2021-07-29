import { ToolboxSettings } from './toolbox-settings.model';

export class ToolboxElementAndSettings {
  constructor(public element: HTMLElement, public settings: ToolboxSettings) {}
}

export class ToolboxesWithSettings {
  caseDetailsToolbox: ToolboxElementAndSettings;
  devToolbox: ToolboxElementAndSettings;
  toolsToolbox: ToolboxElementAndSettings;
  caseObjectsToolbox: ToolboxElementAndSettings;
  cadAssistantToolbox: ToolboxElementAndSettings;

  static builder(): ToolboxesWithSettingsBuilder {
    return new ToolboxesWithSettingsBuilder();
  }
}

export class ToolboxesWithSettingsBuilder {
  private toolboxesWithSettings: ToolboxesWithSettings;
  constructor() {
    this.toolboxesWithSettings = new ToolboxesWithSettings();
  }
  withCaseDetailsToolbox(caseDetailsToolbox: ToolboxElementAndSettings): ToolboxesWithSettingsBuilder {
    this.toolboxesWithSettings.caseDetailsToolbox = caseDetailsToolbox;
    return this;
  }
  withDevToolbox(devToolbox: ToolboxElementAndSettings): ToolboxesWithSettingsBuilder {
    this.toolboxesWithSettings.devToolbox = devToolbox;
    return this;
  }
  withToolsToolbox(toolsToolbox: ToolboxElementAndSettings): ToolboxesWithSettingsBuilder {
    this.toolboxesWithSettings.toolsToolbox = toolsToolbox;
    return this;
  }
  withCaseObjectsToolbox(caseObjectsToolbox: ToolboxElementAndSettings): ToolboxesWithSettingsBuilder {
    this.toolboxesWithSettings.caseObjectsToolbox = caseObjectsToolbox;
    return this;
  }
  withCadAssistantToolbox(cadAssistantToolbox: ToolboxElementAndSettings): ToolboxesWithSettingsBuilder {
    this.toolboxesWithSettings.cadAssistantToolbox = cadAssistantToolbox;
    return this;
  }
  build() {
    return this.toolboxesWithSettings;
  }
}
