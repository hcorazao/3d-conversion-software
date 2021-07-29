import SceneBaseTool from './SceneBaseTool';
import FormTool from './FormTool';
import SceneObjectsManager from '../SceneObjectsManager';

export default class SceneFormTool extends SceneBaseTool {
  constructor(add: number, objectManager: SceneObjectsManager) {
    super(objectManager);
    this.add = add;
    this.cadTool = new FormTool(add);
  }

  protected add: number;

  protected onBeginStartTool(): void {
    this.cadTool.setMesh(
      this.objectManager.restorations[this.objectManager.preparationToothNumber].getMesh(),
      this.objectManager.restorations[this.objectManager.preparationToothNumber].getHalfEdgeMesh().vertexAttributes
    );
  }

  protected onEndStartTool(): void {}
  protected onBeginStopTool(): void {}
  protected onEndStopTool(): void {}
}
