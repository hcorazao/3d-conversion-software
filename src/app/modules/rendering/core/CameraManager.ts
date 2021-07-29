import { AbstractMesh, ArcRotateCamera, Vector3 } from '@babylonjs/core';

/**
 * CameraManager is a core class that enable you to manipulate the camera
 * from different points of the application without sharing a reference around.
 * it also let us to support many cameras if needed.
 *
 * This class uses the singleton pattern.
 */

class CameraManager {
  private static instance: CameraManager;

  private currentCamera: ArcRotateCamera;
  private currentCameraDebug: ArcRotateCamera;

  static getInstance(): CameraManager {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }

    return CameraManager.instance;
  }

  constructor() {}

  set current(camera) {
    this.currentCamera = camera;
  }

  get current() {
    return this.currentCamera;
  }

  set currentDebug(camera) {
    this.currentCameraDebug = camera;
  }

  get currentDebug() {
    return this.currentCameraDebug;
  }

  set position(vector3: Vector3) {
    this.currentCamera.setPosition(vector3);
    this.currentCameraDebug.setPosition(vector3);
  }

  set target(target: Vector3 | AbstractMesh) {
    this.currentCamera.setTarget(target);
    this.currentCameraDebug.setTarget(target);
  }
}

export default CameraManager;
