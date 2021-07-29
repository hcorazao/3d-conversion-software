import { AppFacadeApi } from '@app/facade/app-facade-api';
import { FormToolEnum } from '@app/models/enums/tool-form';
import { AbstractMesh, Vector3 } from '@babylonjs/core';
import { CustomMaterial } from '@babylonjs/materials';
import SceneManager from '../../core/SceneManager';
import SceneObjectsManager from '../SceneObjectsManager';
import SceneBaseTool from './SceneBaseTool';
import SceneFormTool from './SceneFormTool';
import SceneSmoothTool from './SceneSmoothTool';
import SceneAppearance from './SceneAppearance';

import {
  BoundingBox,
  Color3,
  CubeTexture,
  Material,
  Mesh,
  PBRMaterial,
  PBRSpecularGlossinessMaterial,
  StandardMaterial,
  Texture,
  VertexBuffer,
  ShaderMaterial,
  Effect,
} from '@babylonjs/core';
export default class SceneFormToolManager {
  static Instance: SceneFormToolManager;

  protected objectManager: SceneObjectsManager;
  protected appFacadeApi: AppFacadeApi;
  protected formTool: SceneBaseTool[];
  protected activeTool: FormToolEnum;
  protected pointerHover;
  protected mat: CustomMaterial;
  // protected mat: ShaderMaterial;

  constructor(appFacadeApi: AppFacadeApi) {
    this.objectManager = SceneObjectsManager.GetInstance();
    this.appFacadeApi = appFacadeApi;

    // initialize array
    this.formTool = [];
    this.formTool.length = 3;

    // instantiate tools
    this.formTool[FormToolEnum.ADD] = new SceneFormTool(-1, this.objectManager);
    this.formTool[FormToolEnum.ADD].setRadius(appFacadeApi.getToolsSettings().toolRadius);

    this.formTool[FormToolEnum.SUBTRACT] = new SceneFormTool(1, this.objectManager);
    this.formTool[FormToolEnum.SUBTRACT].setRadius(appFacadeApi.getToolsSettings().toolRadius);

    this.formTool[FormToolEnum.SMOOTH] = new SceneSmoothTool(this.objectManager);
    this.formTool[FormToolEnum.SMOOTH].setRadius(appFacadeApi.getToolsSettings().toolRadius);

    // set active tool
    this.activeTool = FormToolEnum.NONE;
    this.pointerHover = { x: 0, y: 0, z: -99999999999 };
  }

  static GetInstance(appFacadeApi: AppFacadeApi): SceneFormToolManager {
    if (!this.Instance) {
      this.Instance = new SceneFormToolManager(appFacadeApi);
    }
    return this.Instance;
  }

  setActiveTool(activateTool: FormToolEnum) {
    if (this.activeTool === FormToolEnum.NONE && activateTool !== FormToolEnum.NONE) {
      this.turnOn(activateTool);
    } else if (activateTool === FormToolEnum.NONE && this.activeTool !== FormToolEnum.NONE) {
      this.turnOff(activateTool);
    } else if (activateTool === this.activeTool) {
      // do nothing
    } else {
      this.switch(activateTool);
    }
    this.activeTool = activateTool;
  }

  protected turnOn(activateTool: FormToolEnum) {
    SceneManager.getInstance().current.onPointerMove = (evt, result) => {
      const pickResult = SceneManager.getInstance().current.pick(evt.offsetX, evt.offsetY);
      if (pickResult.hit) {
        this.pointerHover = pickResult.pickedPoint;
      } else {
        this.pointerHover = { x: 0, y: 0, z: -99999999999 };
      }
    };

    this.createDisc(this.objectManager.restorations[this.objectManager.preparationToothNumber].getMesh(), activateTool);
    this.addDisc(this.objectManager.restorations[this.objectManager.preparationToothNumber].getMesh());

    this.formTool[activateTool].registerToolRadiusListener(this.appFacadeApi);
    this.formTool[activateTool].StartTool();
  }

  protected turnOff(activateTool: FormToolEnum) {
    SceneManager.getInstance().current.onPointerMove = undefined;
    this.pointerHover = { x: 0, y: 0, z: -99999999999 };

    this.formTool[this.activeTool].StopTool();
  }

  protected switch(activateTool: FormToolEnum) {
    this.formTool[this.activeTool].StopTool();

    this.formTool[activateTool].setRadius(this.appFacadeApi.getToolsSettings().toolRadius);
    this.createDisc(this.objectManager.restorations[this.objectManager.preparationToothNumber].getMesh(), activateTool);
    this.addDisc(this.objectManager.restorations[this.objectManager.preparationToothNumber].getMesh());

    this.formTool[activateTool].registerToolRadiusListener(this.appFacadeApi);
    this.formTool[activateTool].StartTool();
  }

  protected addDisc(mesh: AbstractMesh) {
    mesh.material = this.mat;
  }

  protected createDisc(mesh: AbstractMesh, tool: FormToolEnum) {
    this.mat = SceneAppearance.createRestorationMaterial();

    this.mat.onBindObservable.add(() => {
      this.mat.getEffect().setVector3('pickedPoint', this.pointerHover);
      this.mat.getEffect().setFloat('radius', this.formTool[tool].getRadius());
    });
  }
}
