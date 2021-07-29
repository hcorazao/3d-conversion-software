import SceneBaseTool from './SceneBaseTool';
import CRSceneObjectsManager from '../SceneObjectsManager';
import SmoothTool from './SmoothTool';

export default class SceneSmoothTool extends SceneBaseTool {
  constructor(objectManager: CRSceneObjectsManager) {
    super(objectManager);
    this.cadTool = new SmoothTool();
  }

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
