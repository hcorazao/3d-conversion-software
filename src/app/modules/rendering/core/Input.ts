import { Scene, Vector2, Scalar } from '@babylonjs/core';

import Screen from './Screen';
import Time from './Time';
import ZingTouch from 'zingtouch';

/**
 * The input class handles mouse/pad touch interactivity.
 * This class can be consulted for specific user inputs at any time being useful when implementing UI and user to scene interaction.
 *
 * This class uses the singleton pattern.
 */

export default class Input {
  constructor() {
    this.mousePos = new Vector2();
    this.lastMousePos = new Vector2();
    this.mouseDir = new Vector2();

    this.clickedTime = 0;
    this.elapsedTime = 0;
    this.deltaTime = 0;

    this.isMouseDown = false;
    this.isMouseUp = false;

    this.rotationAngle = 0;
    this.rotationDelta = 0;

    this.normalizedMousePos = new Vector2(0, 0);

    this.leftMouseButtonDown = false;
    this.leftMouseButtonPressed = false;
    this.leftMouseButtonReleased = false;
    this.middleMouseButtonDown = false;
    this.rightMouseButtonDown = false;
    this.rightMouseButtonPressed = false;
    this.rightMouseButtonReleased = false;

    this.mousewheel = 0;

    this.previousScale = 0;
    this.previousRotation = 0;
    this.previousRotationDirty = true;

    this.mouseStr = 'mouse';

    this.tmpMouseVelocity = new Vector2(0, 0);
    this.boundingClient = new Vector2(0, 0);

    this.multitouchActive = false;

    this.tapped = false;
    this.initialZoomDistance = 100;
    this.zoomCenter = new Vector2(0, 0);
    this.zoomStarted = false;
    this.touchZoom = 1;

    this.multiTouchDir = new Vector2(0, 0);
    this.wheelDelta = 0;

    this.mac = 'mac';
    this.pinchingWithTrackpad = false;
    this.scrollingWithTrackpad = false;
    this.scrollingWithMouse = false;

    this.doubleClick = false;
    this.middleMouseButtonReleased = false;

    this.canvas = undefined;

    // Input 2.0
    this.previousPosX = 0;
    this.previousPosY = 0;
  }

  get normalized_mouse_pos() {
    this.normalizedMousePos.x = (this.mousePos.x / Screen.getInstance().width) * 2.0 - 1;
    this.normalizedMousePos.y = -1 * ((this.mousePos.y / Screen.getInstance().height) * 2.0 - 1);
    return this.normalizedMousePos;
  }

  get NDC() {
    return this.normalized_mouse_pos;
  }

  private static instance: Input;
  public mousePos: Vector2;
  public lastMousePos: Vector2;
  public mouseDir: Vector2;
  public clickedTime: number;
  public elapsedTime: number;
  public deltaTime: number;
  public isMouseDown: boolean;
  public isMouseUp: boolean;
  public rotationAngle: number;
  public rotationDelta: number;

  public normalizedMousePos: Vector2;
  public leftMouseButtonDown: boolean;
  public leftMouseButtonPressed: boolean;
  public leftMouseButtonReleased: boolean;
  public middleMouseButtonDown: boolean;
  public rightMouseButtonDown: boolean;
  public rightMouseButtonPressed: boolean;
  public rightMouseButtonReleased: boolean;
  public mousewheel: number;
  public previousScale: number;
  public previousRotation: number;
  public previousRotationDirty: boolean;
  public mouseStr: string;
  public tmpMouseVelocity: Vector2;
  public boundingClient: Vector2;
  public multitouchActive: boolean;
  public tapped: boolean;
  public initialZoomDistance: number;
  public zoomCenter: Vector2;
  public zoomStarted: boolean;
  public touchZoom: number;
  public multiTouchDir: Vector2;
  public wheelDelta: number;
  public mac: string;
  public pinchingWithTrackpad: boolean;
  public scrollingWithTrackpad: boolean;
  public scrollingWithMouse: boolean;
  public doubleClick: boolean;
  public middleMouseButtonReleased: boolean;

  private touchZoomDelta: number;
  private lastZoomDistance: number;

  public canvas: HTMLCanvasElement;
  public previousPosX: number;
  public previousPosY: number;

  static getInstance(): Input {
    if (!Input.instance) {
      Input.instance = new Input();
    }
    console.log('instance given');
    return Input.instance;
  }

  mouse_is_within_bounds(rect) {
    rect = rect || this.canvas.getBoundingClientRect();

    return (
      this.mousePos.x > rect.left &&
      this.mousePos.x < rect.left + rect.width &&
      this.mousePos.y > rect.top &&
      this.mousePos.y < rect.top + rect.height
    );
  }

  init(container, canvas) {
    this.canvas = canvas;

    const region = new ZingTouch.Region(container, false, false);

    const scope = this;

    region.bind(container, 'tap', (e) => {
      scope.tapped = true;
      scope.set_mouse_pos(e);
    });

    window.addEventListener('dblclick', this.on_double_click.bind(this));

    container.addEventListener('mouseleave', this.on_focus_lost.bind(this));

    container.addEventListener('mouseup', this.on_mouse_up.bind(this));
    container.addEventListener('mousemove', this.on_mouse_move.bind(this));

    container.addEventListener('touchmove', this.on_touch_move.bind(this), false);
    container.addEventListener('touchend', this.on_touch_end.bind(this), false);

    // region.bind(container, 'pan', function(e){
    //  scope.on_mouse_move(e);
    //  console.log("PAN");
    // });
    const oneFingerPan = new ZingTouch.Pan({ numInputs: 1 });
    region.register('one_finger_pan', oneFingerPan);
    region.bind(container, 'one_finger_pan', (event) => {
      if (event.detail.data.length > 0) {
        // scope.multi_touch_dir.set(event.detail.data[0].change.x, event.detail.data[0].change.y)
        // scope.multi_touch_dir.multiplyScalar(scope.__delta_time);
        // scope.on_mouse_move_zingtouch(event);
      }
    });

    const twoFingersPan = new ZingTouch.Pan({ numInputs: 2 });
    region.register('two_fingers_pan', twoFingersPan);
    region.bind(container, 'two_fingers_pan', (event) => {
      if (event.detail.data.length > 0) {
        // scope.multi_touch_dir.set(event.detail.data[0].change.x, event.detail.data[0].change.y)
        // scope.multi_touch_dir.multiplyScalar(scope.__delta_time);
        scope.multiTouchDir.set(event.detail.data[0].change.x, event.detail.data[0].change.y);
        scope.multiTouchDir.scaleInPlace(scope.deltaTime);
      }
    });

    const threeFingersPan = new ZingTouch.Pan({ numInputs: 3 });
    region.register('three_fingers_pan', threeFingersPan);
    region.bind(container, 'three_fingers_pan', (event) => {
      if (event.detail.data.length > 0) {
        scope.multiTouchDir.set(event.detail.data[0].change.x, event.detail.data[0].change.y);
        scope.multiTouchDir.scaleInPlace(scope.deltaTime);
      }
    });

    region.bind(
      container,
      'distance',
      (e) => {
        if (!scope.zoomStarted) {
          scope.zoomStarted = true;
          scope.touchZoomDelta = 0;
          scope.initialZoomDistance = e.detail.distance;
          scope.lastZoomDistance = e.detail.distance;

          scope.zoomCenter.set(e.detail.center.x, e.detail.center.y);
          scope.mousePos.set(e.detail.center.x, e.detail.center.y);
        }

        scope.touchZoomDelta = e.detail.distance - scope.lastZoomDistance;
        scope.lastZoomDistance = e.detail.distance;
        scope.touchZoom = 1;
      },
      false
    );

    const gesture = new ZingTouch.Gesture();
    gesture.end = (inputs, state, element) => {
      scope.on_gesture_end(inputs);
    };
    gesture.start = (inputs, state, element) => {
      scope.on_mouse_down(inputs);
    };
    region.register('shortTap', gesture);

    region.bind(container, 'shortTap', (e) => {});

    window.addEventListener('wheel', this.on_mouse_wheel.bind(this));
    container.addEventListener(
      'contextmenu',
      (event) => {
        event.preventDefault();
      },
      false
    );

    container.addEventListener('mousemove', (event) => {
      this.mousePos.x = event.clientX;
      this.mousePos.y = event.clientY;
      this.scrollingWithMouse = false;
      this.scrollingWithTrackpad = false;
      this.pinchingWithTrackpad = false;
    });
  }

  set_mouse_pos(ev) {
    this.mousePos.x = ev.detail.events[0].clientX;
    this.mousePos.y = ev.detail.events[0].clientY;
  }

  is_mac() {
    return this.get_os() === this.mac;
  }

  on_double_click(event) {
    this.doubleClick = true;
  }

  on_mouse_wheel(event) {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;

    // User is using a mac
    if (this.is_mac()) {
      // User is pinching
      if (event.ctrlKey) {
        // Negative values means pinch in.
        // Positive values means pinch out.
        console.log('Pinching with a touchpad', event.deltaY);
        this.pinchingWithTrackpad = true;
        this.scrollingWithTrackpad = false;
        this.scrollingWithMouse = false;
        // User is scrolling
      } else {
        // User is using the touchpad
        if (this.is_int(event.deltaY)) {
          // Negative values means scroll up
          // Positive values means scroll down
          // console.log("Scrolling with a touchpad", (event.deltaY))
          // 350 is aprox the maximum value of deltaY on touchpad scroll
          this.pinchingWithTrackpad = false;
          this.scrollingWithTrackpad = true;
          this.scrollingWithMouse = false;

          this.wheelDelta = Scalar.Clamp(event.deltaY / 350, -1, 1) * -1;
        } else {
          // Negative values means scroll up
          // Positive values means scroll down
          // console.log("Scrolling with a mouse", event.deltaY)
          this.pinchingWithTrackpad = false;
          this.scrollingWithTrackpad = false;
          this.scrollingWithMouse = true;

          this.wheelDelta = event.deltaY / Math.abs(event.deltaY);
        }
      }
    } else {
      // probably windows
      this.pinchingWithTrackpad = false;
      this.scrollingWithTrackpad = false;
      this.scrollingWithMouse = true;

      if (Math.abs(event.deltaY) < 0.0001) {
        this.wheelDelta = 0;
      } else {
        this.wheelDelta = event.deltaY / Math.abs(event.deltaY);
      }
    }
  }

  on_mouse_down(inputs) {
    this.mousePos.x = inputs[0].current.clientX;
    this.mousePos.y = inputs[0].current.clientY;

    this.multitouchActive = inputs.length > 1;

    this.mouseDir.x = 0;
    this.mouseDir.y = 0;

    this.clickedTime = this.elapsedTime;
    this.isMouseDown = true;
    this.isMouseUp = false;

    switch (inputs[0].current.originalEvent.which) {
      case 1:
        this.leftMouseButtonDown = true;
        this.leftMouseButtonPressed = true;
        break;
      case 2:
        this.middleMouseButtonDown = true;
        break;
      case 3:
        this.rightMouseButtonDown = true;
        this.rightMouseButtonPressed = true;
        break;
      default:
        this.leftMouseButtonDown = true;
        this.leftMouseButtonPressed = true;
        break;
    }

    this.wheelDelta = 0;
    this.previousScale = 0;
    this.previousRotation = 0;
  }

  mouse_clicked() {
    return this.tapped;
  }

  on_touch_move(e) {
    this.on_mouse_move({
      clientX: e.changedTouches[0].clientX,
      clientY: e.changedTouches[0].clientY,
    });
  }

  on_touch_end(e) {
    this.on_gesture_end([{ current: { originalEvent: e } }]);
  }

  on_mouse_up(e) {
    this.on_gesture_end([{ current: { originalEvent: e } }]);
  }

  on_gesture_end(inputs) {
    this.multitouchActive = inputs ? inputs.length > 1 : false;
    this.isMouseUp = true;
    this.zoomStarted = false;
    this.touchZoom = 1;
    this.mouseDir.x = 0;
    this.mouseDir.y = 0;
    this.previousScale = 0;
    this.previousRotation = 0;
    this.wheelDelta = 0;

    this.leftMouseButtonDown = false;
    this.middleMouseButtonDown = false;
    this.rightMouseButtonDown = false;

    if (inputs) {
      switch (inputs[0].current.originalEvent.which) {
        case 1:
          this.leftMouseButtonReleased = true;
          break;
        case 2:
          this.middleMouseButtonReleased = true;
          break;
        case 3:
          this.rightMouseButtonReleased = true;
          break;
        default:
          this.leftMouseButtonReleased = true;
          break;
      }
    }

    this.isMouseDown = false;
    this.previousRotationDirty = true;
    this.rotationDelta = 0;
  }

  on_focus_lost(e) {
    this.on_gesture_end(e);
    this.leftMouseButtonReleased = true;
    this.middleMouseButtonReleased = true;
    this.rightMouseButtonReleased = true;
    this.leftMouseButtonReleased = true;
  }

  time_since_last_mouse_down() {
    return this.elapsedTime - this.clickedTime;
  }

  on_mouse_move(event) {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;

    this.mouseDir.set(this.mousePos.x - this.previousPosX, this.mousePos.x - this.previousPosY);

    this.mouseDir.normalize();

    this.previousPosX = this.mousePos.x;
    this.previousPosY = this.mousePos.x;
  }

  on_mouse_move_zingtouch(event) {
    if (event.detail.data.length > 0) {
      this.set_mouse_pos(event);
      this.mouseDir.set(event.detail.data[0].change.x, event.detail.data[0].change.y);
    }
  }

  get_os() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'mac';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'ios';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'windows';
    } else if (/Android/.test(userAgent)) {
      os = 'android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'linux';
    }

    return os;
  }

  is_int(n) {
    return n % 1 === 0;
  }

  clear() {
    this.elapsedTime = Time.getInstance().elapsed_time;
    this.deltaTime = Time.getInstance().delta_time;
    this.isMouseUp = false;
    this.wheelDelta = 0;
    this.rotationDelta = 0;

    this.doubleClick = false;

    this.tapped = false;
    this.mouseDir.scaleInPlace(0);
    this.multiTouchDir.scaleInPlace(0);
    this.leftMouseButtonPressed = false;
    this.leftMouseButtonReleased = false;

    this.rightMouseButtonPressed = false;
    this.rightMouseButtonReleased = false;
  }
}
