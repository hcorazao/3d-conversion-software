import { ToolboxSettings } from './toolbox-settings.model';

export class AllToolboxesSettings {
  panelsVisible: boolean;
  devToolboxSettings: ToolboxSettings;
  toolsToolboxSettings: ToolboxSettings;
  caseObjectsToolboxSettings: ToolboxSettings;
  cadAssistantToolboxSettings: ToolboxSettings;

  static createWithDefaultValues(): AllToolboxesSettings {
    const allToolboxSettings = new AllToolboxesSettings();
    allToolboxSettings.panelsVisible = true;
    allToolboxSettings.devToolboxSettings = ToolboxSettings.createWithDefaultValues();
    allToolboxSettings.devToolboxSettings.minimized = true;
    allToolboxSettings.toolsToolboxSettings = ToolboxSettings.createWithDefaultValues();
    allToolboxSettings.caseObjectsToolboxSettings = ToolboxSettings.createWithDefaultValues();
    allToolboxSettings.cadAssistantToolboxSettings = ToolboxSettings.createWithDefaultValues();
    allToolboxSettings.cadAssistantToolboxSettings.tipsEnabled = true;
    return allToolboxSettings;
  }

  static createByUpdating(base: AllToolboxesSettings, update: AllToolboxesSettings): AllToolboxesSettings {
    const result = new AllToolboxesSettings();
    result.panelsVisible = update === undefined || update.panelsVisible === undefined ? base?.panelsVisible : update.panelsVisible;
    result.devToolboxSettings = ToolboxSettings.createByUpdating(base?.devToolboxSettings, update.devToolboxSettings);
    result.toolsToolboxSettings = ToolboxSettings.createByUpdating(base?.toolsToolboxSettings, update.toolsToolboxSettings);
    result.caseObjectsToolboxSettings = ToolboxSettings.createByUpdating(
      base?.caseObjectsToolboxSettings,
      update.caseObjectsToolboxSettings
    );
    result.cadAssistantToolboxSettings = ToolboxSettings.createByUpdating(
      base?.cadAssistantToolboxSettings,
      update.cadAssistantToolboxSettings
    );
    return result;
  }
}
