import State from '../State';
import CreateCopylineAlgorithm from '../../../core/algorithm/CreateCopylineAlgorithm';
import { AppFacadeApi } from '@app/facade/app-facade-api';
import { StateEnum } from '../StateEnum';
import ITransitionFactory from '../../transitions/ITransitionFactory';
import { TransitionEnum } from '../../transitions/TransitionEnum';
import { Vector3 } from '@babylonjs/core';
import SceneTriangulationLineObject from '@app/modules/rendering/components/SceneTriangulationLineObject';

export default class CreateCopyLineState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.CreateCopyLine, appFacadeApi, transitionFactory, [TransitionEnum.Create2CreatedCopyLine]);
  }

  protected _onEnter(): boolean {
    this.objectManager.setJawPickedExclusively(this.objectManager.isPreparation + 1);
    // objectManager.setVisibilityExclusively(objectManager.isPreparation + 1);

    if (this.objectManager.getCopyline(this.objectManager.preparationToothNumber)) {
      // copyline already exists
      return true;
    }

    const copylineObject = new SceneTriangulationLineObject(
      'Copyline',
      this.objectManager,
      null,
      this.objectManager.getPickedAsHalfEdgeMesh()
    );
    this.objectManager.setCopyline(this.objectManager.preparationToothNumber, copylineObject);
    copylineObject.setPrimaryColorRGB(245, 196, 113); // TODO: OEM
    copylineObject.setSecondaryColorRGB(138, 139, 143);
    copylineObject.setTertiaryColorRGB(245, 196, 113);
    copylineObject.setAccentColorRGB(220, 228, 67);

    this.objectManager.getPickedAsSceneObject().addChild(copylineObject);

    if (!copylineObject.import(this.appFacadeApi.getLoadedDentalCaseFolder().vectorsArrays.copylineVectorsArray)) {
      const insertionAxis = this.objectManager.getPickedUpVector();
      const R = this.objectManager.insertionAxis[this.objectManager.preparationToothNumber];
      const i = Vector3.TransformNormal(insertionAxis, R);

      const createCopyline = new CreateCopylineAlgorithm(
        this.objectManager,
        this.objectManager.getPickedAsHalfEdgeMesh(),
        this.objectManager.getPreparationAsHalfEdgeMesh(),
        this.objectManager.getMargin(this.objectManager.preparationToothNumber).polyline,
        i
      );

      createCopyline.compute();
    }
    return true;
  }

  protected _onExit(): boolean {
    return true;
  }
}
