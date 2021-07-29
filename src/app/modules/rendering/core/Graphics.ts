import Screen from './Screen';
import CameraManager from './CameraManager';
import SceneManager from './SceneManager';

import { Engine } from '@babylonjs/core';

/**
 * Graphics takes care of the rendering stage and seting up the rendering Engine.
 * This class let us implement postprocessing effects on an efficient way
 *
 * This class uses the singleton pattern.
 */

class Graphics {
  private static instance: Graphics;

  public engine: Engine;
  private canvasElement: HTMLCanvasElement;
  private cameraManager: CameraManager;

  static getInstance(): Graphics {
    if (!Graphics.instance) {
      Graphics.instance = new Graphics();
    }
    return Graphics.instance;
  }

  constructor() {}

  init(canvas, contextAttributes?) {
    this.canvasElement = canvas;

    contextAttributes = contextAttributes || {
      alpha: true,
      depth: true,
      desynchronized: false,
      stencil: false,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
      audioEngine: false,
    };

    this.engine = new Engine(canvas, contextAttributes.antialias, contextAttributes);
  }

  get canvas() {
    return this.canvasElement;
  }

  update() {
    this.check_for_resize();

    if (this.cameraManager.current) {
      // this.__update_current_camera();
      // this.clear(undefined, CameraManager.current, true, true);
      this.render(this.cameraManager.current, this.cameraManager.current);
    } else {
      console.warn('CameraManager.current does not have a camera assigned');
    }
  }

  __update_current_camera() {
    // this._cameraManager.current.aspect = Screen.aspect_ratio;
    // this._cameraManager.current.updateProjectionMatrix();
    // this._cameraManager.current.updateMatrix();
    // this._cameraManager.current.updateMatrixWorld(true);
  }

  render(scene, camera) {
    // this._engine.setRenderTarget(null);
    // this._engine.render(scene  || SceneManager.current,
    // camera || CameraManager.current);
    scene.render();
  }

  clear(RT, camera, clearDepth, clearStencil, clearBack) {
    // this._engine.setRenderTarget(RT === undefined? null : RT);

    if (camera) {
      // this._engine.setClearColor(camera.clear_color, camera.clear_alpha);
    }

    this.engine.clear(
      camera ? camera.clear_color : 0x00ff00, // clear color
      clearBack ? true : false,
      clearDepth ? true : false,
      clearStencil ? true : false
    );
  }

  check_for_resize() {
    const currentWidth = this.canvas.clientWidth;
    const currentHeight = this.canvas.clientHeight;

    if (
      currentWidth !== Screen.getInstance().width ||
      currentHeight !== Screen.getInstance().height ||
      window.devicePixelRatio !== Screen.getInstance().dpr
    ) {
      Screen.getInstance().dpr = window.devicePixelRatio;
      Screen.getInstance().update_size(currentWidth, currentHeight);

      this.canvas.width = Screen.getInstance().renderWidth;
      this.canvas.height = Screen.getInstance().renderHeight;
      this.engine.setViewport(
        CameraManager.getInstance().current.viewport,
        Screen.getInstance().renderWidth,
        Screen.getInstance().renderHeight
      );

      this.__update_current_camera();
    }
  }
}

export default Graphics;
