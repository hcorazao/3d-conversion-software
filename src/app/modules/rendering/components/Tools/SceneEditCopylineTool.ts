import {} from '@babylonjs/core';

import SceneEditLineTool from './SceneEditLineTool';
import SceneObjectsManager from '../SceneObjectsManager';

export default class SceneEditCopylineTool extends SceneEditLineTool {
  constructor(toothNumber: number, objectManager: SceneObjectsManager) {
    super('CopyLine', objectManager.getCopyline(toothNumber), objectManager);
  }

  protected onBeginStopTool(): void {
    if (this.lineWasEdited) {
      this.objectManager.copies[this.objectManager.preparationToothNumber]?.dispose();
      this.objectManager.copies[this.objectManager.preparationToothNumber] = null;
      this.objectManager.restorations[this.objectManager.preparationToothNumber]?.dispose();
      this.objectManager.restorations[this.objectManager.preparationToothNumber] = null;
    }
  }

  protected onBeginStartTool(): void {}
  protected onEndStartTool(): void {}
  protected onEndStopTool(): void {}
}
