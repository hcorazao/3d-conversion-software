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
  Vector3,
  VertexBuffer,
} from '@babylonjs/core';
import SceneObject from './SceneObject';
import SceneObjectsManager from './SceneObjectsManager';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import SceneManager from '../core/SceneManager';
import SewTwoMeshesAlgorithm from '../core/algorithm/SewTwoMeshesAlgorithm';
import { CustomMaterial } from '@babylonjs/materials';
import Debug from '../core/debug/Debug';
import SceneAppearance from './Tools/SceneAppearance';
/**
 * A scene object for the copy (the part inside the copy line). The static method
 * creates and returns the scene object.
 *
 * There could be more than 1 copy so the tooth number will be stored as well.
 */
export default class SceneRestorationObject extends SceneObject {
  constructor(objectManager: SceneObjectsManager, toothNumber: number, mesh?: Mesh, halfEdgeMesh?: CRHalfEdgeMesh) {
    super(objectManager, mesh, halfEdgeMesh);

    this.toothNumber = toothNumber;
  }

  /**
   * Creates the copy scene object for a given tooth number and returns it.
   * @param toothNumber The tooth number from the copy
   * @param objectManager
   * @param margin
   * @param up
   * @param [visible] Sets the initial visibility between 0 and 1. Default 1.
   * @returns The copy scene object
   */
  static CreateRestoration(toothNumber: number, objectManager: SceneObjectsManager, visible = 1): SceneRestorationObject {
    const topMesh = objectManager.copies[toothNumber].getMesh();
    const bottomMesh = objectManager.spacers[toothNumber].getMesh();

    const restorationMesh = Mesh.MergeMeshes([bottomMesh, topMesh], false, true);
    const restorationMeshHE = new CRHalfEdgeMesh(restorationMesh, true);

    const vAttributes = new Uint8Array(topMesh.getTotalVertices() + bottomMesh.getTotalVertices());
    const copyAttr = objectManager.copies[toothNumber].getHalfEdgeMesh().vertexAttributes;
    const spacerAttr = objectManager.spacers[toothNumber].getHalfEdgeMesh().vertexAttributes;
    vAttributes.set(spacerAttr);
    vAttributes.set(copyAttr, spacerAttr.length);
    restorationMeshHE.vertexAttributes = vAttributes;

    const side = new SewTwoMeshesAlgorithm(restorationMeshHE);
    side.compute();

    restorationMesh.visibility = visible;

    restorationMesh.material = SceneAppearance.createRestorationMaterial();

    objectManager.getDistanceCalculator().createDistanceAttributesForMesh(restorationMesh, restorationMeshHE.vertexAttributes);
    objectManager.restorations[toothNumber] = new SceneRestorationObject(objectManager, toothNumber, restorationMesh, restorationMeshHE);
    return objectManager.restorations[toothNumber];
  }

  protected static createDistanceShaderMaterial(): Material {
    // MG strange - this material is used ONLY before any tool is used, after that, it's just overwritten by Material
    // from SceneFormToolManager
    const mat = new PBRSpecularGlossinessMaterial('', SceneManager.getInstance().current);
    mat.wireframe = true;
    mat.backFaceCulling = false;
    mat.diffuseColor = new Color3(1.0, 0.0, 0.0); // (1.0, 0.766, 0.336);
    mat.specularColor = new Color3(0.0, 0.8, 0.0); // (1.0, 0.766, 0.336);
    mat.glossiness = 0.7; // Let the texture controls the value
    mat.environmentTexture = CubeTexture.CreateFromPrefilteredData(
      'https://playground.babylonjs.com/textures/environment.dds',
      SceneManager.getInstance().current
    );
    mat.specularGlossinessTexture = new Texture('https://playground.babylonjs.com/textures/sg.png', SceneManager.getInstance().current);

    return mat;
  }

  protected static createSpecularGlossinessMaterial(): Material {
    const mat = new PBRSpecularGlossinessMaterial('', SceneManager.getInstance().current);
    mat.wireframe = false;
    mat.backFaceCulling = false;
    mat.diffuseColor = new Color3(1.0, 0.8, 0.4); // (1.0, 0.766, 0.336);
    mat.specularColor = new Color3(1.0, 0.8, 0.4); // (1.0, 0.766, 0.336);
    mat.glossiness = 0.7; // Let the texture controls the value
    mat.environmentTexture = CubeTexture.CreateFromPrefilteredData(
      'https://playground.babylonjs.com/textures/environment.dds',
      SceneManager.getInstance().current
    );
    mat.specularGlossinessTexture = new Texture('https://playground.babylonjs.com/textures/sg.png', SceneManager.getInstance().current);

    return mat;
  }

  protected static createPbrMaterial(): Material {
    const pbr = new PBRMaterial('pbr', SceneManager.getInstance().current);

    SceneManager.getInstance().current.environmentTexture = CubeTexture.CreateFromPrefilteredData(
      'https://playground.babylonjs.com/textures/environment.dds',
      SceneManager.getInstance().current
    );

    pbr.metallic = 0.0;
    pbr.roughness = 0.175;
    pbr.microSurface = 17;

    pbr.subSurface.isTranslucencyEnabled = true;
    // pbr.subSurface.tintColor = new Color3(1.0, 0.766, 0.336);
    // pbr.subSurface.tintColor = new Color3(1.0, 0.8, 0.5);
    pbr.subSurface.tintColor = new Color3(1.0, 0.8, 0.5);

    return pbr;
  }

  getBoundingBox(): BoundingBox {
    return this.mesh.getBoundingInfo().boundingBox;
  }

  protected _dispose() {
    if (this.toothNumber) {
      this.objectManager.restorations[this.toothNumber] = null;
      this.toothNumber = undefined;
    }
  }
}
