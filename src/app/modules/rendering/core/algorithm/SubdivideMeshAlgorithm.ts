import { FloatArray } from '@babylonjs/core';
import IAlgorithm from './IAlgorithm';
import SceneManager from '../SceneManager';
import FriendlyGeometry from '../geometry/FriendlyGeometry';

/**
 * Crsubdivide mesh algorithm
 * @todo Test
 */
export default class SubdivideMeshAlgorithm implements IAlgorithm {
  constructor(mesh: FriendlyGeometry, createNormals = true) {
    this.mesh = mesh;

    this.createNormals = createNormals;
  }

  private mesh: FriendlyGeometry;
  private positions: FloatArray;
  private normals: FloatArray;
  private createNormals: boolean;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    /* TODO
    if (this.createNormals) {
      this.mesh.createNormals(true);
    }
*/

    const t1 = performance.now();
    console.log('Call to CRSubdivideMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return true;
  }
}
