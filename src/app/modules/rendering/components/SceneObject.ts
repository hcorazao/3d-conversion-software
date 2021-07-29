import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { Camera, Mesh, Scene, Color3, IAction, BoundingBox } from '@babylonjs/core';
import SceneObjectsManager from './SceneObjectsManager';

export default abstract class SceneObject {
  constructor(objectManager: SceneObjectsManager, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    this.objectManager = objectManager;
    this.mesh = mesh;
    this.halfEdgeMesh = halfEdgeMesh;
    this.childObjects = [];
  }

  protected objectManager: SceneObjectsManager;

  protected mesh: Mesh;
  protected halfEdgeMesh: CRHalfEdgeMesh;

  protected childObjects: SceneObject[];
  protected toothNumber: number;

  protected primaryColor: Color3;
  protected secondaryColor: Color3;
  protected tertiaryColor: Color3;
  protected accentColor: Color3;

  public abstract getBoundingBox(): BoundingBox;
  protected abstract _dispose(): void;

  dispose() {
    this.mesh?.dispose();
    this.mesh = null;

    this.halfEdgeMesh?.dispose();
    this.halfEdgeMesh = null;

    this._dispose();
  }

  getMesh(): Mesh {
    return this.mesh;
  }

  getHalfEdgeMesh(): CRHalfEdgeMesh {
    return this.halfEdgeMesh;
  }

  setPrimaryColorRGB(r: number, g: number, b: number) {
    this.primaryColor = new Color3(r / 256, g / 256, b / 256);
  }

  setSecondaryColorRGB(r: number, g: number, b: number) {
    this.secondaryColor = new Color3(r / 256, g / 256, b / 256);
  }

  setTertiaryColorRGB(r: number, g: number, b: number) {
    this.tertiaryColor = new Color3(r / 256, g / 256, b / 256);
  }

  setAccentColorRGB(r: number, g: number, b: number) {
    this.accentColor = new Color3(r / 256, g / 256, b / 256);
  }

  registerAction(action: IAction): void {
    this.mesh.actionManager.registerAction(action);
  }

  unregisterAction(action: IAction): void {
    this.mesh.actionManager.unregisterAction(action);
  }

  get isPickable(): boolean {
    return this.mesh.isPickable;
  }

  set isPickable(pickable: boolean) {
    this.mesh.isPickable = pickable;
  }

  get visibility(): number {
    return this.mesh.visibility;
  }

  set visibility(visibility: number) {
    if (this.mesh) {
      this.mesh.visibility = visibility;
    }
    for (const c of this.childObjects) {
      if (c) {
        c.visibility = visibility;
      }
    }
  }

  get wireframe(): boolean {
    return this.mesh.material.wireframe;
  }

  set wireframe(wireframe: boolean) {
    this.mesh.material.wireframe = wireframe;
  }

  addChild(child: SceneObject): void {
    this.childObjects.push(child);
  }

  removeChild(child: SceneObject): boolean {
    const index = this.childObjects.indexOf(child, 0);
    if (index > -1) {
      this.childObjects.splice(index, 1);
      return true;
    }
    return false;
  }
}
