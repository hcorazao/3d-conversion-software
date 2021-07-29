import { FloatArray, Vector3, VertexBuffer } from '@babylonjs/core';

import IAlgorithm from './IAlgorithm';
import Polyline from './Polyline';
import ScalarSigmoidFunction from './ScalarSigmoidFunction';
import SmoothMeshAlgorithm from './SmoothMeshAlgorithm';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import IScalarFunction from './IScalarFunction';

export default class InflateMeshAlgorithm implements IAlgorithm {
  constructor(
    mesh: CRHalfEdgeMesh,
    polyline: Polyline,
    bottomMesh: CRHalfEdgeMesh,
    borderFunction: IScalarFunction,
    lambdaSteps: number,
    createNormals = true
  ) {
    this.mesh = mesh;
    this.bottomMesh = bottomMesh;
    this.polyline = polyline;
    this.borderFunction = borderFunction;
    this.lambdaSteps = lambdaSteps;
    this.createNormals = createNormals;
  }

  private mesh: CRHalfEdgeMesh;
  private bottomMesh: CRHalfEdgeMesh;
  private polyline: Polyline;
  private borderFunction: IScalarFunction;
  private lambdaSteps: number;
  private createNormals: boolean;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const smooth = new SmoothMeshAlgorithm(this.mesh, true, false);

    smooth.compute();
    smooth.compute();
    smooth.compute();

    const factor = 1 / this.lambdaSteps;
    for (let lambda = 0.2; lambda <= 1; lambda += 0.2) {
      lambda = Math.min(1, lambda);

      smooth.compute();
      smooth.compute();

      for (const vertex of this.mesh.vertices) {
        if (!vertex.onBoundary()) {
          const model = this.polyline.getMinDistance(vertex);
          const sp = this.borderFunction.evaluate(model.distance);

          // const idx = this.bottomMesh.getClosestVertexIndex(vertex);
          // const Pground = this.bottomMesh.get_vertex_by_id(idx);

          const tidx = this.bottomMesh.getClosestFaceIndex(vertex);
          const normal = this.bottomMesh.faces[tidx].calcNormal();
          const Pground = this.bottomMesh.faces[tidx].calcCenter();

          /* TODO: project always in the right direction
          const dir = vertex.subtract(Pground);
          dir.normalize();

          if (Vector3.Dot(normal, dir) > 0) {
            const n = normal.negateInPlace;
          }
*/
          // const Pnew = Pground.add(normal.scaleInPlace(sp * lambda));
          // vertex.copyFrom(Pnew);

          if (sp > 0) {
            const dist = Vector3.Distance(vertex, Pground);
            const delta = normal.scale((sp - dist) * lambda);
            vertex.addInPlace(delta);
          } else {
            vertex.copyFrom(Pground);
          }
        }
      }
    }

    /* TODO
    if (this.createNormals) {
      this.mesh.createNormals(true);
    }
    */

    const t1 = performance.now();
    console.log('Call to CRInflateMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return true;
  }
}
