import {} from '@babylonjs/core';

import SceneAddLineTool from './SceneAddLineTool';
import SceneObjectsManager from '../SceneObjectsManager';

export default class SceneAddMarginTool extends SceneAddLineTool {
  constructor(objectManager: SceneObjectsManager) {
    super('MarginLine', objectManager);
    objectManager.setMargin(objectManager.preparationToothNumber, this.marginObject);
  }

  protected onBeginStartTool(): void {}
  protected onEndStartTool(): void {}
  protected onBeginStopTool(): void {}
  protected onEndStopTool(): void {}
}
