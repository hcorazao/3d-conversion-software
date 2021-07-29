import { Vector3 } from '@babylonjs/core';

import IAlgorithm from './IAlgorithm';
import HalfEdgeMesh from '@app/modules/geometry-processing-js/core/halfedgemesh';

export default class SmoothMeshAlgorithm implements IAlgorithm {
  constructor(mesh: HalfEdgeMesh, weighted = false, createNormals = true) {
    this.mesh = mesh;
    this.weighted = weighted;
    this.createNormals = createNormals;
  }

  private mesh: HalfEdgeMesh;
  private weighted: boolean;
  private createNormals: boolean;

  compute(lambda = 1): any {
    // check the performance
    const t0 = performance.now();

    const newPositions: Vector3[] = [];
    for (const vertex of this.mesh.vertices) {
      if (!vertex.onBoundary()) {
        let num = 0;
        let totalArea = 0;
        newPositions[vertex.index] = new Vector3();
        for (const v of vertex.adjacentVertices()) {
          if (!this.weighted) {
            newPositions[vertex.index].addInPlace(v);
          } else {
            let area = v.barycentricDualArea();
            if (area < 0.00001) {
              area = 0.00001;
            }
            newPositions[vertex.index].addInPlace(v.scale(area));
            totalArea += area;
          }
          num++;
        }
        if (!this.weighted) {
          newPositions[vertex.index].scaleInPlace(1 / num);
        } else {
          newPositions[vertex.index].scaleInPlace(1 / totalArea);
        }
      } else {
        newPositions[vertex.index] = new Vector3();
        newPositions[vertex.index].copyFrom(vertex);
      }
    }

    for (const vertex of this.mesh.vertices) {
      vertex.copyFrom(newPositions[vertex.index].scale(lambda).add(vertex.scale(1 - lambda)));
    }

    /* TODO
    if (this.createNormals) {
      this.mesh.createNormals(true);
    }
*/

    const t1 = performance.now();
    console.log('Call to CRSmoothMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return true;
  }
}
