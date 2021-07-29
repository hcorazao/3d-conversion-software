import { FormToolEnum } from './enums/tool-form';

export class ToolsSettings {
  proximalDistance: boolean;
  occlusalDistance: boolean;
  minimalThickness: boolean;
  form: FormToolEnum;
  toolRadius: number;

  static createByUpdating(base: ToolsSettings, update: ToolsSettings): ToolsSettings {
    const result = new ToolsSettings();
    result.proximalDistance =
      update === undefined || update.proximalDistance === undefined ? base.proximalDistance : update.proximalDistance;
    result.occlusalDistance =
      update === undefined || update.occlusalDistance === undefined ? base.occlusalDistance : update.occlusalDistance;
    result.minimalThickness =
      update === undefined || update.minimalThickness === undefined ? base.minimalThickness : update.minimalThickness;
    result.form = update === undefined || update.form === undefined ? base.form : update.form;
    result.toolRadius = update === undefined || update.toolRadius === undefined ? base.toolRadius : update.toolRadius;
    return result;
  }

  static getDefault(): ToolsSettings {
    const toolsSettings = new ToolsSettings();
    toolsSettings.proximalDistance = true;
    toolsSettings.occlusalDistance = true;
    toolsSettings.minimalThickness = true;
    toolsSettings.form = FormToolEnum.NONE;
    toolsSettings.toolRadius = 1;
    return toolsSettings;
  }
}
