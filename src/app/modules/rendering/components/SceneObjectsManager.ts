import { AbstractMesh, Camera, Engine, Matrix, Mesh, Scene, Vector3 } from '@babylonjs/core';
import SceneBottomObject from './SceneBottomObject';
import SceneCopyObject from './SceneCopyObject';
import SceneJawObject from './JawObjects/SceneJawObject';
import SceneSpacerObject from './SceneSpacerObject';
import SceneMinimalThicknessObject from './SceneMinimalThicknessObject';
import SceneRestorationObject from './SceneRestorationObject';
import SceneTriangulationLineObject from './SceneTriangulationLineObject';
import SceneManager from '../core/SceneManager';
import CameraManager from '../core/CameraManager';
import Graphics from '../core/Graphics';
import SceneEditMarginTool from './Tools/SceneEditMarginTool';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import Debug from '../core/debug/Debug';
import DistanceCalculator from './Tools/DistanceCalculator';
import InsertionAxisEffect from './Tools/InsertionAxisEffect';

enum JawType {
  Unknown = 0,
  UpperJaw,
  UpperJawSitu,
  LowerJaw,
  LowerJawSitu,
  BuccalBite,
  // Occlusion, // deprecated: normally UpperJawSitu or LowerJawSitu must be used
  Length, // MUST always be the last entry - insert new elements before!
}

export default class SceneObjectsManager {
  private static instance: SceneObjectsManager;

  static readonly JawType = JawType;
  readonly JawType = SceneObjectsManager.JawType;

  private distanceCalculator: DistanceCalculator;
  private insertionAxisEffect: InsertionAxisEffect;

  private constructor() {
    this.engine = Graphics.getInstance().engine;
    this.scene = SceneManager.getInstance().current;
    this.camera = CameraManager.getInstance().current;
    this.canvas = Graphics.getInstance().canvas;

    this.jaws = [];
    this.marginLines = []; // TODO: better use a map?
    this.copyLines = []; // TODO: better use a map?
    this.bottoms = [];
    this.copies = [];
    this.spacers = [];
    this.minimalThickness = [];
    this.restorations = [];
    this.insertionAxis = [];

    this.isPreparation = JawType.Unknown;
    this.isPicked = JawType.Unknown;

    this.distanceCalculator = new DistanceCalculator();
    this.insertionAxisEffect = new InsertionAxisEffect();
  }

  public engine: Engine;
  public scene: Scene;
  public camera: Camera;
  public canvas: HTMLCanvasElement;

  private jaws: SceneJawObject[];
  public marginLines: SceneTriangulationLineObject[];
  private copyLines: SceneTriangulationLineObject[];

  public bottoms: SceneBottomObject[];
  public copies: SceneCopyObject[];
  public spacers: SceneSpacerObject[];
  public minimalThickness: SceneMinimalThicknessObject[];
  public restorations: SceneRestorationObject[];
  public insertionAxis: Matrix[];

  public isPreparation: JawType;
  public isPicked: JawType;

  public preparationToothNumber: number;
  public caseName: string;

  public editMarginLineTool: SceneEditMarginTool;
  public appFacadeApi: AppFacadeApi;

  static GetInstance(): SceneObjectsManager {
    if (!SceneObjectsManager.instance) {
      SceneObjectsManager.instance = new SceneObjectsManager();
    }
    return SceneObjectsManager.instance;
  }

  getDistanceCalculator(): DistanceCalculator {
    return this.distanceCalculator;
  }

  getInsertionAxisEffect(): InsertionAxisEffect {
    return this.insertionAxisEffect;
  }

  disposeJaws() {
    for (let i = 0; i < JawType.Length; i++) {
      this.jaws[i]?.dispose();
      this.jaws[i] = null;
    }
    this.jaws = [];

    this.preparationToothNumber = undefined;
  }

  disposeRestorations() {
    for (let i = 1; i <= 48; i++) {
      this.restorations[i]?.dispose();
    }
    this.restorations = [];
  }

  disposeIntaglio() {
    for (let i = 1; i <= 48; i++) {
      this.bottoms[i]?.dispose();
      this.spacers[i]?.dispose();
      this.minimalThickness[i]?.dispose();
    }
    this.bottoms = [];
    this.spacers = [];
    this.minimalThickness = [];
  }

  disposeAllButJaws() {
    for (let i = 1; i <= 48; i++) {
      this.bottoms[i]?.dispose();
      this.copies[i]?.dispose();
      this.spacers[i]?.dispose();
      this.minimalThickness[i]?.dispose();
      this.restorations[i]?.dispose();

      this.marginLines[i]?.dispose();
      this.copyLines[i]?.dispose();
    }

    this.bottoms = [];
    this.copies = [];
    this.spacers = [];
    this.minimalThickness = [];
    this.restorations = [];
    this.insertionAxis = [];

    this.marginLines = [];
    this.copyLines = [];
  }

  dispose() {
    this.disposeJaws();
    this.disposeAllButJaws();

    // setTimeout(() => {this.scene.dispose(); }, 500);
    // this.scene.dispose();
  }

  getJawAsMesh(jawType: JawType): Mesh {
    if (this.jaws[jawType]) {
      return this.jaws[jawType].getMesh();
    } else {
      return undefined;
    }
  }

  getJawAsObject(jawType: JawType): SceneJawObject {
    return this.jaws[jawType];
  }

  getJawType(mesh: AbstractMesh): JawType {
    for (let i = 0; i < JawType.Length; i++) {
      if (this.jaws[i]) {
        if (this.jaws[i].getMesh() === mesh) {
          return i as JawType;
        }
      }
    }
    return JawType.Unknown;
  }

  setJaw(jawType: JawType, jawMesh: SceneJawObject): void {
    this.jaws[jawType] = jawMesh;
  }

  getPreparationAsMesh(): AbstractMesh {
    return this.jaws[this.isPreparation].getMesh();
  }

  getAntagonistAsMesh(): Mesh {
    if (this.isPreparation === JawType.LowerJaw) {
      return this.jaws[JawType.UpperJaw].getMesh();
    } else {
      return this.jaws[JawType.LowerJaw].getMesh();
    }
  }

  getProtagonistAsMesh(): Mesh {
    if (this.isPreparation === JawType.LowerJaw) {
      return this.jaws[JawType.LowerJaw].getMesh();
    } else {
      return this.jaws[JawType.UpperJaw].getMesh();
    }
  }

  getPreparationAsHalfEdgeMesh(): CRHalfEdgeMesh {
    return this.jaws[this.isPreparation].getHalfEdgeMesh();
  }

  getSituAsMesh(): AbstractMesh {
    return this.jaws[this.isPreparation + 1].getMesh();
  }

  setPreparation(jaw: JawType): void {
    this.isPreparation = jaw;
  }

  setRestorationPickability(pickable: boolean) {
    this.restorations[this.preparationToothNumber].isPickable = pickable;
  }

  setJawPickedExclusively(jaw: JawType): void {
    this.isPicked = jaw;
    for (let i = 0; i < JawType.Length; i++) {
      if (this.jaws[i]) {
        this.jaws[i].isPickable = false;
      }
    }
    if (this.jaws[this.isPicked]) {
      this.jaws[this.isPicked].isPickable = true;
    }
  }

  getPickedAsMesh(): Mesh {
    if (this.jaws[this.isPicked]) {
      return this.jaws[this.isPicked].getMesh();
    } else {
      return undefined;
    }
  }

  getPickedAsHalfEdgeMesh(): CRHalfEdgeMesh {
    if (this.jaws[this.isPicked]) {
      return this.jaws[this.isPicked].getHalfEdgeMesh();
    } else {
      return undefined;
    }
  }

  getPickedAsSceneObject(): SceneJawObject {
    if (this.jaws[this.isPicked]) {
      return this.jaws[this.isPicked];
    } else {
      return undefined;
    }
  }

  getUpVector(jaw: JawType): Vector3 {
    if (jaw === JawType.LowerJaw || jaw === JawType.LowerJawSitu) {
      return new Vector3(0, 0, 1);
    }
    if (jaw === JawType.UpperJaw || jaw === JawType.UpperJawSitu) {
      return new Vector3(0, 0, -1);
    }
  }

  getPickedUpVector(): Vector3 {
    return this.getUpVector(this.isPicked);
  }

  resetCameraToCenterOfPrepMargin(): boolean {
    if (!this.marginLines[this.preparationToothNumber].polyline) {
      return false;
    }

    const center = this.marginLines[this.preparationToothNumber].getBoundingBox().center;
    const insertionAxis = this.insertionAxis[this.preparationToothNumber];

    const cam = CameraManager.getInstance();
    // TODO: calculate scaling factor
    const scalingFactor = 40;

    const i = Vector3.TransformNormal(this.getUpVector(this.isPreparation), insertionAxis);
    i.scaleInPlace(scalingFactor);

    // set the up vector first
    cam.current.upVector = new Vector3(0, 1, 0);

    cam.position = center.add(i);
    cam.target = center;

    return true;
  }

  setCameraToCenterOfPrepMarginFromMesial(): boolean {
    if (!this.marginLines[this.preparationToothNumber].polyline) {
      return false;
    }

    const center = this.marginLines[this.preparationToothNumber].getBoundingBox().center;
    const insertionAxis = this.insertionAxis[this.preparationToothNumber];

    const rotateX = Matrix.RotationX((90 / 180) * Math.PI);
    const rotateZ = Matrix.RotationZ((90 / 180) * Math.PI);

    const cam = CameraManager.getInstance();

    // cam.current.rotation=rotateX;

    // TODO: calculate scaling factor
    const scalingFactor = 40;

    let i = Vector3.TransformNormal(this.getUpVector(this.isPreparation), insertionAxis);
    i = Vector3.TransformNormal(i, rotateX);
    i = Vector3.TransformNormal(i, rotateZ);
    i.scaleInPlace(scalingFactor);

    // set the up vector first
    // let u = Vector3.TransformNormal(cam.current.upVector, insertionAxis.invert());
    // u = Vector3.TransformNormal(u, rotateX);
    // u = Vector3.TransformNormal(u, rotateZ);
    const up = this.getUpVector(this.isPreparation);
    cam.current.upVector = new Vector3(up._x, up._y, up._z);

    // cam.position = new Vector3(center.x, center.y, this.getUpVector(this.isPreparation).scale(scalingFactor).z);
    cam.position = center.add(i);
    cam.target = center;

    return true;
  }

  setCameraToCenterOfPrepMarginFromDistal(): boolean {
    if (!this.marginLines[this.preparationToothNumber].polyline) {
      return false;
    }

    const center = this.marginLines[this.preparationToothNumber].getBoundingBox().center;
    const insertionAxis = this.insertionAxis[this.preparationToothNumber];

    const rotateX = Matrix.RotationX((-90 / 180) * Math.PI);
    const rotateZ = Matrix.RotationZ((90 / 180) * Math.PI);

    const cam = CameraManager.getInstance();

    // cam.current.rotation=rotateX;

    // TODO: calculate scaling factor
    const scalingFactor = 40;

    let i = Vector3.TransformNormal(this.getUpVector(this.isPreparation), insertionAxis);
    i = Vector3.TransformNormal(i, rotateX);
    i = Vector3.TransformNormal(i, rotateZ);
    i.scaleInPlace(scalingFactor);

    // cam.position = new Vector3(center.x, center.y, this.getUpVector(this.isPreparation).scale(scalingFactor).z);
    cam.position = center.add(i);
    cam.target = center;

    // let u = Vector3.TransformNormal(cam.current.upVector, insertionAxis.invert());
    // u = Vector3.TransformNormal(u, rotateX);
    // u = Vector3.TransformNormal(u, rotateZ);
    const up = this.getUpVector(this.isPreparation);
    cam.current.upVector = new Vector3(up._x, up._y, up._z);

    return true;
  }

  resetCameraToCenterOfJaw(jaw: JawType): void {
    const meshCenter = this.getPickedAsMesh().getBoundingInfo().boundingBox.center;
    const cam = CameraManager.getInstance();
    // TODO: calculate scaling factor
    const scalingFactor = 60;

    /*
    const size = this.getPickedAsMesh().getBoundingInfo().boundingBox.extendSizeWorld;
    const maxSize = size.x > size.y ? size.x :size.y;
    const ratio = Graphics.getInstance().engine.getAspectRatio(cam.current);
    const h = maxSize / (Math.tan (cam.current.fov / 2) * ratio);
*/

    cam.position = new Vector3(meshCenter.x, meshCenter.y, this.getUpVector(jaw).scale(scalingFactor).z);
    cam.target = meshCenter;
  }

  resetCameraPicked(): void {
    this.resetCameraToCenterOfJaw(this.isPicked);
  }

  resetCameraPreparation(): void {
    this.resetCameraToCenterOfJaw(this.isPreparation);
  }

  setMargin(toothNumber: number, margin: SceneTriangulationLineObject): void {
    this.marginLines[toothNumber] = margin;
    this.getJawAsObject(this.isPreparation).addChild(margin);
  }

  getMargin(toothNumber: number): SceneTriangulationLineObject {
    return this.marginLines[toothNumber];
  }

  setBottom(toothNumber: number, bottom: SceneBottomObject): void {
    this.bottoms[toothNumber] = bottom;
  }

  getBottom(toothNumber: number): SceneBottomObject {
    return this.bottoms[toothNumber];
  }

  setCopyline(toothNumber: number, copyline: SceneTriangulationLineObject): void {
    this.copyLines[toothNumber] = copyline;
  }

  getCopyline(toothNumber: number): SceneTriangulationLineObject {
    return this.copyLines[toothNumber];
  }

  setMinimalThickness(toothNumber: number, minimalThickness: SceneMinimalThicknessObject): void {
    // TODO Jerzy: add object availability here
    this.minimalThickness[toothNumber] = minimalThickness;
  }

  getMinimalThickness(toothNumber: number): SceneMinimalThicknessObject {
    return this.minimalThickness[toothNumber];
  }

  setRestorationVisibility(visible: number) {
    this.restorations[this.preparationToothNumber].visibility = visible;

    const caseObjectsSettings = new CaseObjectsSettings();
    caseObjectsSettings.crown.opacity = visible;
    this.appFacadeApi.updateCaseObjectsSettings(caseObjectsSettings);
  }

  setJawVisibility(jaw: JawType) {
    const caseObjectsSettings = new CaseObjectsSettings();

    if (this.jaws[jaw]) {
      this.jaws[jaw].visibility = 1;
    }

    switch (jaw) {
      case JawType.UpperJaw:
        caseObjectsSettings.upperJaw.opacity = 1;
        break;
      case JawType.UpperJawSitu:
        caseObjectsSettings.upperJawSitu.opacity = 1;
        break;
      case JawType.LowerJaw:
        caseObjectsSettings.lowerJaw.opacity = 1;
        break;
      case JawType.LowerJawSitu:
        caseObjectsSettings.lowerJawSitu.opacity = 1;
        break;
    }

    this.appFacadeApi.updateCaseObjectsSettings(caseObjectsSettings);
  }

  setJawVisibilityExclusively(jaw: JawType) {
    const caseObjectsSettings = new CaseObjectsSettings();

    for (let i = 0; i < JawType.Length; i++) {
      if (this.jaws[i]) {
        this.jaws[i].visibility = 0;
      }
    }

    caseObjectsSettings.upperJaw.opacity = 0;
    caseObjectsSettings.upperJawSitu.opacity = 0;
    caseObjectsSettings.lowerJaw.opacity = 0;
    caseObjectsSettings.lowerJawSitu.opacity = 0;

    if (this.jaws[jaw]) {
      this.jaws[jaw].visibility = 1;
    }

    switch (jaw) {
      case JawType.UpperJaw:
        caseObjectsSettings.upperJaw.opacity = 1;
        break;
      case JawType.UpperJawSitu:
        caseObjectsSettings.upperJawSitu.opacity = 1;
        break;
      case JawType.LowerJaw:
        caseObjectsSettings.lowerJaw.opacity = 1;
        break;
      case JawType.LowerJawSitu:
        caseObjectsSettings.lowerJawSitu.opacity = 1;
        break;
    }

    this.appFacadeApi.updateCaseObjectsSettings(caseObjectsSettings);
  }

  setWireframe(wireframe: boolean) {
    for (let i = 0; i < JawType.Length; i++) {
      if (this.jaws[i]) {
        this.jaws[i].wireframe = wireframe;
      }
    }

    for (let i = 0; i < 48; i++) {
      if (this.bottoms[i]) {
        this.bottoms[i].wireframe = wireframe;
      }
    }

    for (let i = 0; i < 48; i++) {
      if (this.spacers[i]) {
        this.spacers[i].wireframe = wireframe;
      }
    }

    for (let i = 0; i < 48; i++) {
      if (this.copies[i]) {
        this.copies[i].wireframe = wireframe;
      }
    }

    for (let i = 0; i < 48; i++) {
      if (this.minimalThickness[i]) {
        this.minimalThickness[i].wireframe = wireframe;
      }
    }

    for (let i = 0; i < 48; i++) {
      if (this.restorations[i]) {
        this.restorations[i].wireframe = wireframe;
      }
    }
  }
}
