/**
 * Screen is a core class that enables you to keep a reference to the canvas metadata.
 *
 * It tracks the width and height of the screen as well as the renderer width and height.
 * It also also saves the DPR of the device.
 *
 * This information is usefull when implementing behaviour that depends on the screen size
 * but also postprocessing effects.
 *
 * This class uses the singleton pattern.
 */

export default class Screen {
  constructor() {
    this.width = 1;
    this.height = 1;

    this.renderWidth = 1;
    this.renderHeight = 1;

    this.dpr = 1;
  }

  get aspect_ratio() {
    return this.width / this.height;
  }

  private static instance: Screen;

  public width: number;
  public height: number;
  public renderWidth: number;
  public renderHeight: number;
  public dpr: number;

  static getInstance(): Screen {
    if (!Screen.instance) {
      Screen.instance = new Screen();
    }
    return Screen.instance;
  }

  update_size(width, height) {
    this.width = width;
    this.height = height;

    this.renderWidth = width * this.dpr;
    this.renderHeight = height * this.dpr;
  }
}
