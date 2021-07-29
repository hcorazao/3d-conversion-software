import { AppFacadeApi } from '@app/facade/app-facade-api';
import { Camera, Matrix, Vector3 } from '@babylonjs/core';
import SceneObjectsManager from '../../components/SceneObjectsManager';
import CameraManager from '../../core/CameraManager';
import ITransitionFactory from '../transitions/ITransitionFactory';
import { TransitionEnum } from '../transitions/TransitionEnum';
import State from './State';
import { StateEnum } from './StateEnum';

export default class InsertionAxisCreatedState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.InsertionAxisCreated, appFacadeApi, transitionFactory, [
      TransitionEnum.InsertionAxis2CreateCopyLine,
      TransitionEnum.InsertionAxis2AppStarted,
      TransitionEnum.InsertionAxis2PrepMargin,
      TransitionEnum.InsertionAxis2CopyLine,
      TransitionEnum.InsertionAxis2CopyRestoration,
      TransitionEnum.InsertionAxis2ExportRestoration,
    ]);
  }

  protected _onEnter(): boolean {
    SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.GetInstance().isPreparation);
    SceneObjectsManager.GetInstance().setJawVisibilityExclusively(SceneObjectsManager.GetInstance().isPreparation);

    // restrict rotation
    if (this.objectManager.isPicked === SceneObjectsManager.JawType.LowerJaw) {
      this.restrictRotation((1 * Math.PI) / 4, (3 * Math.PI) / 4, (1 * Math.PI) / 4, (3 * Math.PI) / 4, 0);
    } else {
      this.restrictRotation((-3 * Math.PI) / 4, (-1 * Math.PI) / 4, (1 * Math.PI) / 4, (3 * Math.PI) / 4, 0);
    }

    // reset scene with focus on prep margin
    SceneObjectsManager.GetInstance().resetCameraToCenterOfPrepMargin();

    return true;
  }

  protected _onExit(): boolean {
    // remove restriction
    this.restrictRotation(null, null, null, null, 1000);

    // calculate ne rotation matrix of insertion axis
    const om = SceneObjectsManager.GetInstance();
    const cam = CameraManager.getInstance().current;
    const pos = cam.position;
    const target = cam.target;
    const i = pos.subtract(target).normalize();
    const M = Matrix.Identity();
    Matrix.RotationAlignToRef(om.getPickedUpVector(), i, M);

    // set new insertion axis
    om.insertionAxis[om.preparationToothNumber] = M;

    // TODO: if insertion axis has been changed, then invalidated minimal thickness

    return true;
  }

  /**
   * Helper funtion to restrict the rotation angles
   * @param lowerAlphaLimit For the lower limit of alpha
   * @param upperAlphaLimit For the upper limit of alpha
   * @param lowerBetaLimit For the lower limit of beta
   * @param upperBetaLimit For the upper limit of beta
   */
  protected restrictRotation(
    lowerAlphaLimit: number,
    upperAlphaLimit: number,
    lowerBetaLimit: number,
    upperBetaLimit: number,
    panLimit: number
  ) {
    const camera = CameraManager.getInstance().current;
    const cameraDebug = CameraManager.getInstance().currentDebug;

    // set panning
    camera.panningSensibility = panLimit;
    cameraDebug.panningSensibility = panLimit;

    camera.lowerAlphaLimit = lowerAlphaLimit;
    camera.upperAlphaLimit = upperAlphaLimit;
    cameraDebug.lowerAlphaLimit = lowerAlphaLimit;
    cameraDebug.upperAlphaLimit = upperAlphaLimit;

    camera.lowerBetaLimit = lowerBetaLimit;
    camera.upperBetaLimit = upperBetaLimit;
    cameraDebug.lowerBetaLimit = lowerBetaLimit;
    cameraDebug.upperBetaLimit = upperBetaLimit;
  }
}
