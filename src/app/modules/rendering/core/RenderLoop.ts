import Time from './Time';
import Input from './Input';
import Graphics from './Graphics';
import MainApplication from './../MainApplication';

/**
 * RenderLoop is a core class that controls the rendering loop and makes sure this rendering runs at
 * a certain rendering speed.
 * it also let us to support many cameras if needed.
 */

class RenderLoop {
  private frameId: number;
  private graphics: Graphics;
  public application: MainApplication;

  private input: Input;

  private isRunning: boolean;

  constructor(application: MainApplication, graphics: Graphics) {
    this.frameId = -1;

    this.application = application;
    this.graphics = graphics;

    this.isRunning = true;

    this.input = Input.getInstance();
  }

  update() {
    if (!this.isRunning) {
      return;
    }

    Time.getInstance().__update();

    // ###### START CYCLE ######

    this.application.update();

    this.application.on_pre_render();
    this.graphics.update(); // render scene
    this.application.on_post_render();

    // ###### END  CYCLE #######

    Input.getInstance().clear();

    this.frameId = requestAnimationFrame(this.update.bind(this));
  }

  start() {
    this.application.start();
    this.update();
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
    this.application.stop();

    cancelAnimationFrame(this.frameId);
  }
}

export default RenderLoop;
