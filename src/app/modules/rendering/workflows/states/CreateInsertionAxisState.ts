import { AppFacadeApi } from '@app/facade/app-facade-api';
import { BoundingBox, Vector3 } from '@babylonjs/core';
import SceneBottomObject from '../../components/SceneBottomObject';
import SceneObjectsManager from '../../components/SceneObjectsManager';
import InsertionAxisAlgorithm from '../../core/algorithm/InsertionAxisAlgorithm';
import Debug from '../../core/debug/Debug';
import ITransitionFactory from '../transitions/ITransitionFactory';
import { TransitionEnum } from '../transitions/TransitionEnum';
import State from './State';
import { StateEnum } from './StateEnum';

export default class CreateInsertionAxisState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.CreateInsertionAxis, appFacadeApi, transitionFactory, [TransitionEnum.Create2CreatedInsertionAxis]);
  }

  protected _onEnter(): boolean {
    SceneObjectsManager.GetInstance().setJawPickedExclusively(SceneObjectsManager.GetInstance().isPreparation);
    SceneObjectsManager.GetInstance().setJawVisibilityExclusively(SceneObjectsManager.GetInstance().isPreparation);

    let bottomMesh;
    if (!this.objectManager.bottoms[this.objectManager.preparationToothNumber]) {
      bottomMesh = SceneBottomObject.CreateBottom(
        this.objectManager.preparationToothNumber,
        this.objectManager,
        this.objectManager.getMargin(this.objectManager.preparationToothNumber),
        this.objectManager.getPickedUpVector(),
        0
      );
    } else {
      bottomMesh = this.objectManager.bottoms[this.objectManager.preparationToothNumber];
    }

    // MG TODO: search for better places

    // MG TODO: call ONCE after ALL mehes have been loaded
    const bb = this.objectManager.bottoms[this.objectManager.preparationToothNumber].getBoundingBox().scale(1.3);
    const minimum = bb.minimum.add(new Vector3(0, 0, -5));
    const maximum = bb.maximum.add(new Vector3(0, 0, 5));
    const bbNew = new BoundingBox(minimum, maximum);
    // Debug.getInstance().debug_bb(bbNew);

    this.objectManager.getDistanceCalculator().addSenderMesh(this.objectManager.getAntagonistAsMesh(), true, bbNew);
    this.objectManager.getDistanceCalculator().addSenderMesh(this.objectManager.getProtagonistAsMesh(), false, bbNew);
    this.objectManager.getDistanceCalculator().finishSetup(bbNew);

    if (!this.objectManager.insertionAxis[this.objectManager.preparationToothNumber]) {
      const insertionAxis = new InsertionAxisAlgorithm(bottomMesh.getHalfEdgeMesh(), this.objectManager.getPickedUpVector());
      const M = insertionAxis.compute();

      this.objectManager.insertionAxis[this.objectManager.preparationToothNumber] = M;
    }

    return true;
  }

  protected _onExit(): boolean {
    return true;
  }
}
