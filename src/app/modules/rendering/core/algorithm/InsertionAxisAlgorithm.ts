import { Color3, Matrix, Mesh, MeshBuilder, StandardMaterial, Vector3 } from '@babylonjs/core';

import IAlgorithm from './IAlgorithm';

import fmin from 'fmin';
import SceneManager from '../SceneManager';
import HalfEdgeMesh from '@app/modules/geometry-processing-js/core/halfedgemesh';

export default class InsertionAxisAlgorithm implements IAlgorithm {
  /**
   * Mesh  of insertion axis algorithm
   */
  private mesh: HalfEdgeMesh;

  /**
   * Insertion axis of insertion axis algorithm
   */
  private insertionAxis: Vector3;

  constructor(mesh: HalfEdgeMesh, insertionAxis: Vector3) {
    this.mesh = mesh;
    this.insertionAxis = insertionAxis;
  }

  /**
   * Weights the dot product of the normal & insertion axis. 1 (means in the same direction) will become 0.
   * 0 (means in a 90° angle) will become 1. Negative values (means undercuts) greater than 1 increasing quadratically.
   * @param x The value to be weighted
   * @returns The final weighted value
   */
  private weight(x: number): number {
    return x * x - 2 * x + 1;
  }

  /**
   * Computes insertion axis algorithm
   * @returns The final output
   */
  compute(): any {
    const ctx = this;

    /**
     * Sums weighted dot products
     * @param angles Current angles in deg
     * @returns weighted dot products
     */
    function sumWeightedDotProducts(angles: number[]): number {
      const R = Matrix.RotationYawPitchRoll((angles[0] / 180.0) * Math.PI, (angles[1] / 180.0) * Math.PI, (angles[2] / 180.0) * Math.PI);
      const i = Vector3.TransformNormal(ctx.insertionAxis, R);

      let sum = 0;
      for (const face of ctx.mesh.faces) {
        if (face) {
          const n = face.calcNormal();
          if (n) {
            sum += ctx.weight(Vector3.Dot(n, i));
          }
        }
      }

      return sum;
    }

    // check the performance
    const t0 = performance.now();
    /*
    const BB = this.mesh.calcBoundingBox();
    const c = BB.center;
    c.z = BB.maximum.z;
*/
    // this.drawArrow('upArrow', c, this.insertionAxis, new Color3(0, 0, 1));

    // https://github.com/benfred/fmin
    const solution = fmin.nelderMead(sumWeightedDotProducts, [10.2, 10.2, 0]);

    const t1 = performance.now();
    console.log('Call to CRInsertionAxisAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    const rotM = Matrix.RotationYawPitchRoll(
      (solution.x[0] / 180.0) * Math.PI,
      (solution.x[1] / 180.0) * Math.PI,
      (solution.x[2] / 180.0) * Math.PI
    );
    /*
    this.drawArrow(
      'insertionAxisArrow',
      c,
      Vector3.TransformNormal(this.insertionAxis, rotM),
      new Color3(1, 1, 0)
    );
*/

    return rotM;
  }

  /**
   * Helper function: Draws an arrow
   * @param name The name of the scene object
   * @param position The start position of the arrow
   * @param dir The normalized direction of the arrow
   * @param color The color of the arrow
   * @returns Mesh of the arrow
   */
  private drawArrow(name: string, position: Vector3, dir: Vector3, color: Color3): Mesh {
    const tube = MeshBuilder.CreateTube(
      name,
      { path: [position, dir.scale(5).add(position)], radius: 0.1 },
      SceneManager.getInstance().current
    );

    const mat = new StandardMaterial(name + '_Material', SceneManager.getInstance().current);
    mat.diffuseColor = color;
    mat.backFaceCulling = false;
    tube.material = mat;

    return tube;
  }
}
