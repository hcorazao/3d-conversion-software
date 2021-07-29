import { Scene } from '@babylonjs/core';

/**
 * SceneManager is a core class that enable you to manipulate the scene
 * from different points of the application without sharing a reference around.
 * It allow us to easily place objects into the scene.
 *
 * This class uses the singleton pattern.
 */

class SceneManager {
  constructor() {}

  set current(scene: Scene) {
    this.currentScene = scene;
  }

  get current() {
    return this.currentScene;
  }

  set currentDebug(scene: Scene) {
    this.currentSceneDebug = scene;
  }

  get currentDebug() {
    return this.currentSceneDebug;
  }

  private static instance: SceneManager;
  private currentScene: Scene;
  private currentSceneDebug: Scene;

  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }
}

export default SceneManager;
