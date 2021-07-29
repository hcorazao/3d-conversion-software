import { Engine } from '@babylonjs/core';

/**
 * Time is a core class that enables you to track time. It keeps a reference to the delta time and
 * to the time passed between events and since the component started.
 *
 * This class uses the singleton pattern.
 */

export default class Time {
  private static instance: Time;

  private deltaTime: number;
  private elapsedTime: number;
  private initialTime: number;
  private engine3D: Engine;

  static getInstance(): Time {
    if (!Time.instance) {
      Time.instance = new Time();
    }
    return Time.instance;
  }

  constructor() {
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.initialTime = performance.now();
  }

  set engine(engine: Engine) {
    this.engine3D = engine;
  }

  get delta_time() {
    return this.deltaTime;
  }
  get elapsed_time() {
    return this.elapsedTime;
  }

  __update() {
    this.deltaTime = this.engine3D.getDeltaTime();
    this.elapsedTime = performance.now() - this.initialTime;
  }
}
