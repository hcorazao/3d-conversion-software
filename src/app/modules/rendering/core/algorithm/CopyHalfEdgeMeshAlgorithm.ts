import { Color4 } from '@babylonjs/core';
import CRHalfEdgeMesh from './../../../geometry-processing-js/core/CRHalfEdgeMesh';
import IAlgorithm from './IAlgorithm';
import CopyMeshAlgorithm from './CopyMeshAlgorithm';

export default class CopyHalfEdgeMeshAlgorithm implements IAlgorithm {
  constructor(name: string, inputMesh: CRHalfEdgeMesh, color: Color4, createNormals = true) {
    this.name = name;
    this.inputMesh = inputMesh;
    this.color = color;
    this.createNormals = createNormals;
  }

  private name: string;
  private inputMesh: CRHalfEdgeMesh;
  private color: Color4;
  private createNormals: boolean;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const copy = new CopyMeshAlgorithm(this.name, this.inputMesh.mesh, this.color, false);
    const customMesh = copy.compute();

    const customMeshHE = new CRHalfEdgeMesh(customMesh, false);

    customMeshHE.updateMesh();

    if (this.createNormals) {
      customMesh.createNormals(true);
    }

    const t1 = performance.now();
    console.log('Call to CopyHalfEdgeMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return customMeshHE;
  }
}
