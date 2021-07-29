import {
  Texture,
  Material,
  SceneLoader,
  Scene,
  ArcRotateCamera,
  Vector3,
  Color3,
  DirectionalLight,
  StandardMaterial,
} from '@babylonjs/core';
import { CustomMaterial } from '@babylonjs/materials';
import SceneManager from '../../core/SceneManager';
/**
 * A class handling EVERYTHING that changes the appearance of the scene.
 * This consists of lighting, materials and parameters needed to adjust the visual result.
 */
export default class SceneAppearance {
  static addLightingToScene(scene: Scene, camera: ArcRotateCamera) {
    const light1Current = new DirectionalLight('light1', new Vector3(0, 0, -1), scene);
    const light2Current = new DirectionalLight('light2', new Vector3(0, 0, 1), scene);

    const specIntesity = 0.7;
    // remove the highlight on model
    light1Current.specular = new Color3(specIntesity, specIntesity, specIntesity);
    light2Current.specular = new Color3(specIntesity, specIntesity, specIntesity);

    // the light follows the camera
    light1Current.parent = camera;
    light2Current.parent = camera;
  }

  /**
   * Creating the material for the loaded mesh files
   * @param name the material name
   */
  static createStandardMaterial(name: string): StandardMaterial {
    const mat = new StandardMaterial(name, SceneManager.getInstance().current);
    mat.backFaceCulling = false;
    // mat.roughness = 0.9;
    mat.specularPower = 128;
    mat.needDepthPrePass = true;
    return mat;
  }
  /**
   * The insertionAxis shader material for the stump.
   */
  static createInsertionAxisMaterial(): CustomMaterial {
    const mat = new CustomMaterial('insertionAxisMaterial', SceneManager.getInstance().current);
    mat.backFaceCulling = true;
    mat.needDepthPrePass = true;
    mat.Fragment_Before_FragColor(`
        color.xyz = vec3(237.0/256.0,219.0/256.0,52.0/256.0);
        `);
    return mat;
  }
  /**
   * The distance shader material for the restoration obect.
   */
  static createRestorationMaterial(): CustomMaterial {
    const mat = new CustomMaterial('restorationMaterial', SceneManager.getInstance().current);
    mat.backFaceCulling = false;

    // adjusting material:
    mat.specularColor = new Color3(250 / 256, 250 / 256, 250 / 256);
    mat.ambientColor = new Color3(220 / 256, 220 / 256, 220 / 256);
    mat.diffuseColor = new Color3(210 / 256, 210 / 256, 210 / 256);

    // this.mat.roughness = 0.5;
    mat.specularPower = 128;
    mat.needDepthPrePass = true;
    // we need to add none value (empty transparent picture) texture for add vDiffuseUV to Attribute
    mat.diffuseTexture = new Texture('assets/images/empty.png', SceneManager.getInstance().current);

    mat.Fragment_Before_FragColor(`
        const float aaSize = 0.004; // antialiasing step size
        const float startDitherBlue = 0.8; // between 1 and this value, we have a soft color ramp from blue to tooth color

        // at 0, we switch to green
        const float boundary1 = -0.05;
        const float boundary2 = -0.1;

        float blueAlpha = smoothstep(startDitherBlue,1.0, vDiffuseUV.x); // blend color boundary 80->100%

        float colorStep = smoothstep(-boundary2-aaSize,-boundary2+aaSize,vDiffuseUV.x); // AA border blue1->blue2
        vec3 distColor = mix(vec3(0.0/256.0, 110.0/256.0, 197.0/256.0),vec3(0.0/256.0, 52.0/256.0, 204.0/256.0),colorStep);

        colorStep = smoothstep(-boundary1-aaSize,-boundary1+aaSize,vDiffuseUV.x); // AA border blue2->blue3
        distColor = mix(vec3(1.0/256.0, 176.0/256.0, 245.0/256.0),distColor,colorStep);

        colorStep = smoothstep(0.0-aaSize,0.0+aaSize,vDiffuseUV.x); // AA border blue3->green
        distColor = mix(vec3(8.0/256.0, 175.0/256.0, 80.0/256.0),distColor,colorStep);

        colorStep = smoothstep(boundary1-aaSize,boundary1+aaSize,vDiffuseUV.x); // AA border green->yellow
        distColor = mix(vec3(255.0/256.0, 240.0/256.0, 1.0/256.0),distColor,colorStep);

        colorStep = smoothstep(boundary2-aaSize,boundary2+aaSize,vDiffuseUV.x); // AA border yellow->red
        distColor = mix(vec3(253.0/256.0, 0.0/256.0, 0.0/256.0),distColor,colorStep);

        // add 60% shading to distance colors
        color = 0.6*color+0.6*vec4(mix(distColor,color.xyz, blueAlpha), 1.0);


        float circleDistance =  length(pickedPoint - vPositionW.xyz);
        vec3 colorWithCircle = vec3(mix(color.xyz, 0.6*diskColor+0.4*color.xyz, step (circleDistance, radius)));
        color.xyz = mix(colorWithCircle,color.xyz, step(vDiffuseUV.y,5.0));

        `);

    mat.AddUniform('pickedPoint', 'vec3', new Vector3());
    mat.AddUniform('radius', 'float', 0);
    mat.AddUniform('diskColor', 'vec3', new Vector3(232 / 256, 115 / 256, 1 / 256));

    return mat;
  }
}
