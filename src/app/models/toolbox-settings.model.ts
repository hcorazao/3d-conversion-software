export class ToolboxSettings {
  leftHalf: boolean;
  topHalf: boolean;
  offsetX: number;
  offsetY: number;
  repositioned: boolean;
  minimized: boolean;
  tipsEnabled: boolean;
  closed: boolean;

  constructor() {}

  static createWithDefaultValues(): ToolboxSettings {
    const toolboxSettings = new ToolboxSettings();
    toolboxSettings.leftHalf = false;
    toolboxSettings.topHalf = false;
    toolboxSettings.offsetX = 0;
    toolboxSettings.offsetY = 0;
    toolboxSettings.repositioned = false;
    toolboxSettings.minimized = false;
    toolboxSettings.tipsEnabled = false;
    toolboxSettings.closed = false;
    return toolboxSettings;
  }

  static createWithOffsets(leftHalf: boolean, topHalf: boolean, offsetX: number, offsetY: number): ToolboxSettings {
    const toolboxSettings = new ToolboxSettings();
    toolboxSettings.leftHalf = leftHalf;
    toolboxSettings.topHalf = topHalf;
    toolboxSettings.offsetX = offsetX;
    toolboxSettings.offsetY = offsetY;
    toolboxSettings.repositioned = true;
    return toolboxSettings;
  }

  static createWithMinimized(minimized: boolean): ToolboxSettings {
    const toolboxSettings = new ToolboxSettings();
    toolboxSettings.minimized = minimized;
    return toolboxSettings;
  }

  static createWithTipsEnabled(tipsEnabled: boolean): ToolboxSettings {
    const toolboxSettings = new ToolboxSettings();
    toolboxSettings.tipsEnabled = tipsEnabled;
    return toolboxSettings;
  }

  static createWithClosed(closed: boolean): ToolboxSettings {
    const toolboxSettings = new ToolboxSettings();
    toolboxSettings.closed = closed;
    return toolboxSettings;
  }

  static createByUpdating(base: ToolboxSettings, update: ToolboxSettings): ToolboxSettings {
    const result = new ToolboxSettings();
    result.leftHalf = update === undefined || update.leftHalf === undefined ? base?.leftHalf : update.leftHalf;
    result.topHalf = update === undefined || update.topHalf === undefined ? base?.topHalf : update.topHalf;
    result.offsetX = update === undefined || update.offsetX === undefined ? base?.offsetX : update.offsetX;
    result.offsetY = update === undefined || update.offsetY === undefined ? base?.offsetY : update.offsetY;
    result.repositioned = result.offsetX !== 0 || result.offsetY !== 0;
    result.minimized = update === undefined || update.minimized === undefined ? base?.minimized : update.minimized;
    result.tipsEnabled = update === undefined || update.tipsEnabled === undefined ? base?.tipsEnabled : update.tipsEnabled;
    result.closed = update === undefined || update.closed === undefined ? base?.closed : update.closed;
    return result;
  }
}
