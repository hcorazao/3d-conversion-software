import { Mesh, VertexData, VertexBuffer, Color4 } from '@babylonjs/core';
import SceneManager from '../SceneManager';
import IAlgorithm from './IAlgorithm';

export default class CopyMeshAlgorithm implements IAlgorithm {
  constructor(name: string, inputMesh: Mesh, color: Color4, inverted = false, createNormals = true) {
    this.name = name;
    this.inputMesh = inputMesh;
    this.color = color;
    this.inverted = inverted;
    this.createNormals = createNormals;
  }

  private name: string;
  private inputMesh: Mesh;
  private color: Color4;
  private inverted: boolean;
  private createNormals: boolean;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const positions = Object.assign([], this.inputMesh.getVerticesData(VertexBuffer.PositionKind));
    const indices = Object.assign([], this.inputMesh.getIndices());

    if (this.inverted) {
      const len = indices.length / 3;
      for (let i = 0; i < len; i++) {
        const tmp = indices[3 * i + 1];
        indices[3 * i + 1] = indices[3 * i + 2];
        indices[3 * i + 2] = tmp;
      }
    }

    // set color
    const colors = [];
    for (let i = 0; i < positions.length / 3; i++) {
      colors[i * 4 + 0] = this.color.r;
      colors[i * 4 + 1] = this.color.g;
      colors[i * 4 + 2] = this.color.b;
      colors[i * 4 + 3] = this.color.a;
    }

    // set vertex data
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.colors = colors;

    const customMesh = new Mesh(this.name, SceneManager.getInstance().current);
    vertexData.applyToMesh(customMesh);

    if (this.createNormals) {
      customMesh.createNormals(true);
    }

    const t1 = performance.now();
    console.log('Call to CopyMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');

    return customMesh;
  }
}
