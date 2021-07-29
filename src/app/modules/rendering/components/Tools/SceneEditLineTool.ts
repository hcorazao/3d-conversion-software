import { Matrix, Scene, Vector3, PointerEventTypes, PointerInfo, EventState } from '@babylonjs/core';

import ISceneBaseTool from './ISceneBaseTool';
import SceneObjectsManager from '../SceneObjectsManager';
import SceneTriangulationLineObject from '../SceneTriangulationLineObject';
import SceneManager from '../../core/SceneManager';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import ViewAPI from '../../ViewApi';
import Debug from '../../core/debug/Debug';

export default abstract class SceneEditLineTool implements ISceneBaseTool {
  constructor(lineName: string, lineObject: SceneTriangulationLineObject, objectManager: SceneObjectsManager) {
    this.scene = SceneManager.getInstance().current;
    this.objectManager = objectManager;
    this.lineName = lineName;

    this.lineWasEdited = false;

    this.sceneToolStarted = false;
    this.epsilon = 0.3;

    this.inCameraDirection = true;

    this.originalLineObject = lineObject;
    this.lineObject = new SceneTriangulationLineObject(this.lineName + '_Edit', objectManager);
    this.lineObject.setPrimaryColorRGB(245, 196, 113);
    this.lineObject.setSecondaryColorRGB(138, 139, 143);
    this.lineObject.setTertiaryColorRGB(138, 139, 143);
    this.lineObject.setAccentColorRGB(220, 228, 67);

    this.clickHandler = this.onLeftDoubleClick.bind(this);

    this.pointerCallback = (pointerInfo: PointerInfo, eventState: EventState) => {
      const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.objectManager.camera);
      const hit = this.scene.pickWithRay(ray);

      if (hit.hit) {
        // left click
        if (pointerInfo.event.button === 0) {
          switch (pointerInfo.type) {
            case PointerEventTypes.POINTERTAP:
              if (this.lineObject.getControlPoints().length > 0) {
                this.onAddNewControlPoint(hit.pickedPoint, this.inCameraDirection);
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
      }
    };
  }

  protected scene: Scene;
  protected objectManager: SceneObjectsManager;
  protected readonly lineName: string;

  protected sceneToolStarted: boolean;
  protected readonly epsilon: number;

  protected inCameraDirection: boolean;

  protected startPoint: Vector3;
  protected endPoint: Vector3;

  protected lineObject: SceneTriangulationLineObject;
  protected originalLineObject: SceneTriangulationLineObject;

  protected lineWasEdited: boolean;

  protected pointerCallback: any;
  protected activeCallback: () => void;
  protected inactiveCallback: () => void;
  protected clickHandler;

  protected abstract onBeginStartTool();
  protected abstract onEndStartTool();
  protected abstract onBeginStopTool();
  protected abstract onEndStopTool();

  onLeftDoubleClick(event) {
    if (!this.sceneToolStarted) {
      return;
    }
    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), this.objectManager.camera);
    const hit = this.scene.pickWithRay(ray);

    this.onDeleteLastControlPoint();
    const model = this.originalLineObject.isClose(hit.pickedPoint, this.epsilon);

    if (this.lineObject.getControlPoints().length === 0 && model.isClose) {
      this.startPoint = model.closestPoint;
      this.onSetStartControlPoint(this.startPoint, this.inCameraDirection);
    } else if (model.isClose) {
      this.endPoint = model.closestPoint;
      this.onSetLastControlPoint(this.endPoint, this.inCameraDirection);
      ViewAPI.getInstance().API.toggleCadAssistantExportDisabled(false);
    }
  }

  setActiveCallbacks(activeCallback: () => void, inactiveCallback: () => void): void {
    this.activeCallback = activeCallback;
    this.inactiveCallback = inactiveCallback;
  }

  setUndoRedoCallbacks() {
    ViewAPI.getInstance().API.configureUndoRedoButtons(
      () => {
        this.undo();
        // this.onDeleteLastControlPoint();
      },
      () => {
        this.redo();
      }
    );
  }

  protected undo() {
    if (this.lineObject.getControlPoints().length > 0) {
      // push last point on redo stack and enable redo button
      this.lineObject.getRedoControlPoints().push(this.lineObject.getControlPoints()[this.lineObject.getControlPoints().length - 1]);
      ViewAPI.getInstance().API.setRedoButtonEnability(true);

      this.onDeleteLastControlPoint();

      // if no control point available anymore, disable undo button
      if (this.lineObject.getControlPoints().length === 0) {
        ViewAPI.getInstance().API.setUndoButtonEnability(false);
      }
    }
  }

  protected redo() {
    const redo = this.lineObject.getRedoControlPoints();
    if (redo.length > 0) {
      const c = redo.pop();
      this.lineObject.addNewControlPoint(c, false, false, true);
      ViewAPI.getInstance().API.setUndoButtonEnability(true);

      // if redo stack is now empty, then disable redo button
      if (redo.length === 0) {
        ViewAPI.getInstance().API.setRedoButtonEnability(false);
      }
    }
  }

  protected onSetStartControlPoint(pickedPoint: Vector3, inCameraDirection: boolean): void {
    if (this.activeCallback) {
      this.activeCallback();
    }
    this.lineObject.addNewControlPoint(pickedPoint, false, false, inCameraDirection);

    // delete redo stack and disable redo button
    this.lineObject.getRedoControlPoints().length = 0;
    ViewAPI.getInstance().API.setUndoButtonEnability(true);
    ViewAPI.getInstance().API.setRedoButtonEnability(false);
  }

  protected onAddNewControlPoint(pickedPoint: Vector3, inCameraDirection: boolean) {
    if (
      Vector3.Distance(pickedPoint, this.lineObject.getControlPoints()[this.lineObject.getControlPoints().length - 1]) > this.epsilon &&
      Vector3.Distance(pickedPoint, this.lineObject.getControlPoints()[0]) > this.epsilon
    ) {
      this.lineObject.addNewControlPoint(pickedPoint, false, false, inCameraDirection);

      // delete redo stack and disable redo button
      this.lineObject.getRedoControlPoints().length = 0;
      ViewAPI.getInstance().API.setRedoButtonEnability(false);
    }
  }

  protected onSetLastControlPoint(pickedPoint: Vector3, inCameraDirection: boolean) {
    if (Vector3.Distance(pickedPoint, this.lineObject.getControlPoints()[0]) > this.epsilon) {
      this.lineObject.addNewControlPoint(pickedPoint, true, false, inCameraDirection);
      this.lineWasEdited = true;
      this.StopTool();
      if (this.inactiveCallback) {
        this.inactiveCallback();
      }

      window.removeEventListener('dblclick', this.clickHandler);

      this.lineWasEdited = false;
      this.StartTool();
    }
  }

  protected onDeleteLastControlPoint(): void {
    const proceed = this.lineObject.deleteLastControlPoint();
    if (!proceed) {
      // last control point was removed
      this.resetLineObject();
      this.StopTool();
      if (this.inactiveCallback) {
        this.inactiveCallback();
      }
      this.StartTool();
    }
  }

  protected changeLineSegments(): void {
    const lenEdited = this.lineObject.getLength();
    const lenOriginal = this.originalLineObject.getLength();

    const curveEdited = this.lineObject.getCurve();
    const curveOriginal = this.originalLineObject.getCurve();
    const trianglesIdxEdited = this.lineObject.polyline.getTriangleIndices();
    const trianglesIdxOriginal = this.originalLineObject.polyline.getTriangleIndices();
    let startIdx = curveOriginal.indexOf(this.startPoint);
    let endIdx = curveOriginal.indexOf(this.endPoint);

    const oldPart = this.originalLineObject.getPart(startIdx, endIdx);
    const curveOld = oldPart.getCurve();
    const lenOld = oldPart.length();

    const dirEdited = curveEdited[2].subtract(curveEdited[0]).normalize();
    const dirOld = curveOld[2].subtract(curveOld[0]).normalize();

    // check, if same orientation, if no, reverse list
    if (Vector3.Dot(dirEdited, dirOld) < 0) {
      // reverse
      const tmp = startIdx;
      startIdx = endIdx;
      endIdx = tmp;
      curveEdited.reverse();
      trianglesIdxEdited.reverse();
    }

    if (startIdx < endIdx) {
      // remove old part
      curveOriginal.splice(startIdx, endIdx - startIdx + 1);
      trianglesIdxOriginal.splice(startIdx, endIdx - startIdx + 1);

      // insert new line
      let i = startIdx;
      for (const p of curveEdited) {
        curveOriginal.splice(i++, 0, p);
      }
      i = startIdx;
      for (const t of trianglesIdxEdited) {
        trianglesIdxOriginal.splice(i++, 0, t);
      }
    } else {
      // remove old parts
      curveOriginal.splice(startIdx, curveOriginal.length - startIdx);
      curveOriginal.splice(0, endIdx + 1);
      trianglesIdxOriginal.splice(startIdx, trianglesIdxOriginal.length - startIdx);
      trianglesIdxOriginal.splice(0, endIdx + 1);

      // append the new line and the first point to close the line
      for (const v of curveEdited) {
        curveOriginal.push(v);
      }
      for (const v of trianglesIdxEdited) {
        trianglesIdxOriginal.push(v);
      }
      curveOriginal.push(curveOriginal[0]);
      trianglesIdxOriginal.push(trianglesIdxOriginal[0]);
    }

    this.originalLineObject.update(this.lineName);

    this.resetLineObject();
  }

  protected resetLineObject() {
    this.lineObject.dispose();
    this.lineObject = null;
    this.lineObject = new SceneTriangulationLineObject(this.lineName + '_Edit', this.objectManager);
    this.lineObject.setPrimaryColorRGB(245, 196, 113);
    this.lineObject.setSecondaryColorRGB(138, 139, 143);
    this.lineObject.setTertiaryColorRGB(138, 139, 143);
    this.lineObject.setAccentColorRGB(220, 228, 67);
  }

  public StartTool(): void {
    if (!this.sceneToolStarted) {
      // additionally check if margin exists
      this.onBeginStartTool();
      this.setUndoRedoCallbacks();
      this.scene.onPointerObservable.add(this.pointerCallback);
      window.addEventListener('dblclick', this.clickHandler);
      this.sceneToolStarted = true;
      this.onEndStartTool();
    }
  }

  public StopTool(): void {
    if (this.sceneToolStarted) {
      this.onBeginStopTool();
      this.scene.onPointerObservable.removeCallback(this.pointerCallback);
      window.removeEventListener('dblclick', this.clickHandler);

      if (this.lineObject.polyline && this.lineObject.getControlPoints().length) {
        this.changeLineSegments();
      }

      // delete redo stack and disable redo button
      this.lineObject.getRedoControlPoints().length = 0;
      ViewAPI.getInstance().API.setUndoButtonEnability(false);
      ViewAPI.getInstance().API.setRedoButtonEnability(false);

      this.sceneToolStarted = false;
      this.onEndStopTool();
    }
  }
}
