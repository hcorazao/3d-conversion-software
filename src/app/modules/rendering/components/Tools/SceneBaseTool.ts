import { AppFacadeApi } from '@app/facade/app-facade-api';
import { ActionManager, Camera, ExecuteCodeAction, Matrix, Scene, PointerEventTypes } from '@babylonjs/core';
import SceneObjectsManager from '../SceneObjectsManager';
import BaseTool from './BaseTool';

export default abstract class SceneBaseTool {
  constructor(objectManager: SceneObjectsManager) {
    this.scene = objectManager.scene;
    this.camera = objectManager.camera;
    this.canvas = objectManager.canvas;
    this.objectManager = objectManager;
    this.cadTool = null;

    // HACK: this must be refactored -> should be moved to a scene handler or state machine (ulfwil)
    this.mouseDown = false;
    this.rotate = false;
    this.scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          this.mouseDown = true;
          break;
        case PointerEventTypes.POINTERUP:
          this.mouseDown = false;
          this.rotate = false;
          this.scene.activeCamera.attachControl();
          this.cadTool.addUndoItem();
          break;
      }
    });

    this.executeCadTool = new ExecuteCodeAction({ trigger: ActionManager.OnEveryFrameTrigger }, () => {
      if (this.mouseDown) {
        // check the performance
        const t0 = performance.now();

        const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.camera);
        // const hit = this.scene.pickWithRay(ray);
        const hit = this.scene.pickWithRay(ray);
        // @ts-ignore
        // const hit = ray.intersectsMesh(this.scene.meshes[0] as Mesh, true);

        let t1 = performance.now();
        console.log('Call to ExecuteCodeAction:rayCast() took ' + (t1 - t0) + ' milliseconds.');

        if (hit.pickedMesh && !this.rotate) {
          this.scene.activeCamera.detachControl();
          this.cadTool.ApplyTool(hit);
        } else {
          this.rotate = true;
        }

        t1 = performance.now();
        console.log('Call to ExecuteCodeAction:addTool() took ' + (t1 - t0) + ' milliseconds.');
      }
    });
  }

  protected scene: Scene;
  protected camera: Camera;
  protected canvas: HTMLCanvasElement;
  protected objectManager: SceneObjectsManager;
  protected cadTool: BaseTool;
  private executeCadTool: ExecuteCodeAction;
  private mouseDown: boolean;
  private rotate: boolean;

  protected abstract onBeginStartTool(): void;
  protected abstract onEndStartTool(): void;
  protected abstract onBeginStopTool(): void;
  protected abstract onEndStopTool(): void;

  registerToolRadiusListener(appFacadeApi: AppFacadeApi) {
    this.cadTool.registerToolRadiusListener(appFacadeApi);
  }

  public setRadius(r: number): void {
    if (this.cadTool) {
      this.cadTool.setRadius(r);
    }
  }

  public getRadius(): number {
    return this.cadTool?.getRadius();
  }

  public setIntensity(i: number): void {
    if (this.cadTool) {
      this.cadTool.setIntensity(i);
    }
  }

  public StartTool(): void {
    this.onBeginStartTool();

    this.scene.actionManager = new ActionManager(this.scene);
    this.scene.actionManager.registerAction(this.executeCadTool);
    this.cadTool.setUndoRedoCallbacks();
    this.cadTool.initializeUndoRedo();

    this.onEndStartTool();
  }

  public StopTool(): void {
    this.onBeginStopTool();

    this.scene.actionManager.unregisterAction(this.executeCadTool);

    this.onEndStopTool();
  }
}
