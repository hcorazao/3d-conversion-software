import { Matrix, Scene, Vector3, PointerEventTypes, PointerInfo, EventState } from '@babylonjs/core';

import ISceneBaseTool from './ISceneBaseTool';
import SceneObjectsManager from '../SceneObjectsManager';
import SceneTriangulationLineObject from '../SceneTriangulationLineObject';
import ViewAPI from '../../ViewApi';
import { AppFacadeApi } from '@app/facade/app-facade-api';

export default abstract class SceneAddLineTool implements ISceneBaseTool {
  constructor(lineName: string, objectManager: SceneObjectsManager) {
    this.scene = objectManager.scene;
    this.objectManager = objectManager;
    this.lineName = lineName;

    this.sceneToolStarted = false;
    this.epsilon = 0.4;

    this.marginObject = new SceneTriangulationLineObject('Margin', objectManager);
    this.marginObject.setPrimaryColorRGB(245, 196, 113); // TODO OEM
    this.marginObject.setSecondaryColorRGB(138, 139, 143);
    this.marginObject.setTertiaryColorRGB(232, 115, 1);
    this.marginObject.setAccentColorRGB(220, 228, 67);

    this.pointerCallback = (pointerInfo: PointerInfo, eventState: EventState) => {
      // left click
      if (pointerInfo.event.button === 0) {
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERDOUBLETAP:
            if (this.marginObject.getControlPoints().length === 0) {
              this.onSetStartControlPoint();
              ViewAPI.getInstance().API.notifyPreparationMarginEntering();
            } else {
              this.onSetLastControlPoint();
            }
            break;
          case PointerEventTypes.POINTERTAP:
            if (this.marginObject.getControlPoints().length > 0) {
              this.onAddNewControlPoint();
            }
            break;
        }
      }
      // right click
      else if (pointerInfo.event.button === 2) {
        switch (pointerInfo.type) {
          case PointerEventTypes.POINTERTAP:
            this.undo();
            break;
        }
      }
    };
  }

  protected scene: Scene;
  protected objectManager: SceneObjectsManager;
  protected readonly lineName: string;

  protected sceneToolStarted: boolean;
  protected epsilon: number;

  protected marginObject: SceneTriangulationLineObject;

  protected pointerCallback: any;
  protected activeCallback: () => void;
  protected inactiveCallback: () => void;

  protected abstract onBeginStartTool();
  protected abstract onEndStartTool();
  protected abstract onBeginStopTool();
  protected abstract onEndStopTool();

  setActiveCallbacks(activeCallback: () => void, inactiveCallback: () => void): void {
    this.activeCallback = activeCallback;
    this.inactiveCallback = inactiveCallback;
  }

  setUndoRedoCallbacks() {
    ViewAPI.getInstance().API.configureUndoRedoButtons(
      () => {
        this.undo();
      },
      () => {
        this.redo();
      }
    );
  }

  protected undo() {
    if (this.marginObject.getControlPoints().length > 0) {
      // push last point on redo stack and enable redo button
      this.marginObject.getRedoControlPoints().push(this.marginObject.getControlPoints()[this.marginObject.getControlPoints().length - 1]);
      ViewAPI.getInstance().API.setRedoButtonEnability(true);

      this.onDeleteLastControlPoint();

      // if no control point available anymore, disable undo button
      if (this.marginObject.getControlPoints().length === 0) {
        ViewAPI.getInstance().API.setUndoButtonEnability(false);
      }
    }
  }

  protected redo() {
    const redo = this.marginObject.getRedoControlPoints();
    if (redo.length > 0) {
      const c = redo.pop();
      this.marginObject.addNewControlPoint(c, false, false, true);
      ViewAPI.getInstance().API.setUndoButtonEnability(true);

      // if redo stack is now empty, then disable redo button
      if (redo.length === 0) {
        ViewAPI.getInstance().API.setRedoButtonEnability(false);
      }
    }
  }

  protected onSetStartControlPoint(): void {
    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.objectManager.camera);
    const hit = this.scene.pickWithRay(ray);

    if (hit.hit) {
      if (this.activeCallback) {
        this.activeCallback();
      }

      this.marginObject.addNewControlPoint(hit.pickedPoint, false, false, true);

      // delete redo stack and disable redo button
      this.marginObject.getRedoControlPoints().length = 0;
      ViewAPI.getInstance().API.setRedoButtonEnability(false);
    }
  }

  protected onAddNewControlPoint(): void {
    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.objectManager.camera);
    const hit = this.scene.pickWithRay(ray);

    if (hit.hit) {
      if (
        Vector3.Distance(hit.pickedPoint, this.marginObject.getControlPoints()[this.marginObject.getControlPoints().length - 1]) >
          this.epsilon &&
        Vector3.Distance(hit.pickedPoint, this.marginObject.getControlPoints()[0]) > this.epsilon
      ) {
        this.marginObject.addNewControlPoint(hit.pickedPoint, false, false, true);

        // delete redo stack and disable redo button
        this.marginObject.getRedoControlPoints().length = 0;
        ViewAPI.getInstance().API.setRedoButtonEnability(false);
      }
    }
  }

  protected onSetLastControlPoint(): void {
    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.objectManager.camera);
    const hit = this.scene.pickWithRay(ray);

    if (hit.hit) {
      if (Vector3.Distance(hit.pickedPoint, this.marginObject.getControlPoints()[0]) < this.epsilon) {
        this.marginObject.addNewControlPoint(hit.pickedPoint, true, true, true);
        this.StopTool();

        if (this.inactiveCallback) {
          this.inactiveCallback();
        }
      }
    }
  }

  protected onDeleteLastControlPoint(): void {
    this.marginObject.deleteLastControlPoint();
  }

  public StartTool(): void {
    if (!this.sceneToolStarted) {
      this.onBeginStartTool();
      this.scene.onPointerObservable.add(this.pointerCallback);
      this.sceneToolStarted = true;
      this.onEndStartTool();
    }
  }

  public StopTool(): void {
    if (this.sceneToolStarted) {
      this.onBeginStopTool();
      this.scene.onPointerObservable.removeCallback(this.pointerCallback);
      this.sceneToolStarted = false;

      // delete redo stack and disable redo button
      this.marginObject.getRedoControlPoints().length = 0;
      ViewAPI.getInstance().API.setUndoButtonEnability(false);
      ViewAPI.getInstance().API.setRedoButtonEnability(false);

      this.onEndStopTool();
    }
  }
}
