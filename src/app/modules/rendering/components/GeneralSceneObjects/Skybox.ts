import { Mesh, Texture, StandardMaterial, CubeTexture, Color3 } from '@babylonjs/core';

import SceneManager from './../../core/SceneManager';

export default class Skybox {
  private skybox: Mesh;

  constructor() {
    // Skybox
    this.skybox = Mesh.CreateBox('skybox', 1000.0, SceneManager.getInstance().current);
    const skyboxMaterial = new StandardMaterial('skybox_mat', SceneManager.getInstance().current);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new CubeTexture(
      './../../assets/texture/skybox/TropicalSunnyDay',
      SceneManager.getInstance().current
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    this.skybox.material = skyboxMaterial;
  }
}
