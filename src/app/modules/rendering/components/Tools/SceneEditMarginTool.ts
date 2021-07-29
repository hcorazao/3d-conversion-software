import {} from '@babylonjs/core';

import SceneEditLineTool from './SceneEditLineTool';
import SceneObjectsManager from '../SceneObjectsManager';

export default class SceneEditMarginTool extends SceneEditLineTool {
  constructor(toothNumber: number, objectManager: SceneObjectsManager) {
    super('MarginLine', objectManager.getMargin(toothNumber), objectManager);
  }

  protected onBeginStopTool(): void {
    if (this.lineWasEdited) {
      this.objectManager.bottoms[this.objectManager.preparationToothNumber]?.dispose();
      this.objectManager.bottoms[this.objectManager.preparationToothNumber] = null;
      this.objectManager.spacers[this.objectManager.preparationToothNumber]?.dispose();
      this.objectManager.spacers[this.objectManager.preparationToothNumber] = null;
      this.objectManager.minimalThickness[this.objectManager.preparationToothNumber]?.dispose();
      this.objectManager.minimalThickness[this.objectManager.preparationToothNumber] = null;
      this.objectManager.restorations[this.objectManager.preparationToothNumber]?.dispose();
      this.objectManager.restorations[this.objectManager.preparationToothNumber] = null;
    }
  }

  protected onBeginStartTool(): void {}
  protected onEndStartTool(): void {}
  protected onEndStopTool(): void {}
}
