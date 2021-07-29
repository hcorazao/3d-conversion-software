import { AppFacadeApi } from '@app/facade/app-facade-api';
import CreateMarginThicknessAlgorithm from './../../../core/algorithm/CreateMarginThicknessAlgorithm';
import SceneCopyObject from '@app/modules/rendering/components/SceneCopyObject';
import SceneMinimalThicknessObject from '@app/modules/rendering/components/SceneMinimalThicknessObject';
import SceneSpacerObject from '@app/modules/rendering/components/SceneSpacerObject';
import ITransitionFactory from '../../transitions/ITransitionFactory';
import { TransitionEnum } from '../../transitions/TransitionEnum';
import State from '../State';
import { StateEnum } from '../StateEnum';
import SceneRestorationObject from '@app/modules/rendering/components/SceneRestorationObject';
import { CaseObjectsSettings } from '@app/models/case-objects-settings.model';

export default class CreateCopyRestorationState extends State {
  constructor(appFacadeApi: AppFacadeApi, transitionFactory: ITransitionFactory) {
    super(StateEnum.CreateCopyRestoration, appFacadeApi, transitionFactory, [TransitionEnum.Create2CreatedCopyRestoration]);
  }

  protected _onEnter(): boolean {
    // check, whether the spacer and margin thickness have to be calculated
    if (!this.objectManager.spacers[this.objectManager.preparationToothNumber]) {
      const spacer = SceneSpacerObject.CreateSpacer(
        this.objectManager.preparationToothNumber,
        this.objectManager,
        this.objectManager.getMargin(this.objectManager.preparationToothNumber),
        this.objectManager.getPickedUpVector(),
        0
      );

      const margin = new CreateMarginThicknessAlgorithm(
        this.objectManager,
        spacer.getHalfEdgeMesh(),
        this.objectManager.getPickedUpVector()
      );
      margin.compute();
      spacer.getHalfEdgeMesh().updateMesh();
    }
    /*
    // check, whether the minimal thickness body has to be calculated
    if (!this.objectManager.minimalThickness[this.objectManager.preparationToothNumber]) {
      SceneMinimalThicknessObject.CreateMinimalThickness(
        this.objectManager.preparationToothNumber,
        this.objectManager,
        this.objectManager.getMargin(this.objectManager.preparationToothNumber),
        this.objectManager.getPickedUpVector(),
        this.appFacadeApi.getToolsSettings().minimalThickness ? 1 : 0
      );
    }
*/
    // check, whether the copy surface has to be calculated
    if (!this.objectManager.copies[this.objectManager.preparationToothNumber]) {
      SceneCopyObject.CreateCopy(
        this.objectManager.preparationToothNumber,
        this.objectManager,
        this.objectManager.getCopyline(this.objectManager.preparationToothNumber),
        this.objectManager.getPickedUpVector(),
        0
      );
    }

    // check, whether the full restoration has to be calculated
    if (!this.objectManager.restorations[this.objectManager.preparationToothNumber]) {
      SceneRestorationObject.CreateRestoration(this.objectManager.preparationToothNumber, this.objectManager, 1);
    }

    const caseObjectsSettings = new CaseObjectsSettings();
    caseObjectsSettings.crown.opacity = 1;
    caseObjectsSettings.crown.available = true;
    this.appFacadeApi.updateCaseObjectsSettings(caseObjectsSettings);

    return true;
  }

  protected _onExit(): boolean {
    return true;
  }
}
