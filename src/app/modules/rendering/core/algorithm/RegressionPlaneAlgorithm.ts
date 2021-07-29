import { AbstractMesh, Mesh, VertexData, VertexBuffer, Plane, Vector3 } from '@babylonjs/core';

import IAlgorithm from './IAlgorithm';
// import * as vectorious from 'vectorious';

export default class RegressionPlaneAlgorithm implements IAlgorithm {
  constructor(points: Vector3[]) {
    this.points = points;
  }

  private points: Vector3[];

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const arr = [];
    for (const p of this.points) {
      const elem = p.asArray();
      elem.push(1);
      arr.push(elem);
    }
    /*
    const A = vectorious.array(arr);
    const B = [[0], [0], [0], [0]];
    const x = vectorious.solve(A, B);
    console.log(A);
    console.log(B);
    console.log(x);

    const regPlane = new Plane(x[0], x[1], x[2], x[3]);
*/
    const t1 = performance.now();
    console.log('Call to RegressionPlaneAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return null;
  }
}
