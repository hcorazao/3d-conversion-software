import { VertexData, VertexBuffer, Matrix, AbstractMesh, Mesh, SceneLoader, StandardMaterial } from '@babylonjs/core';
import SceneManager from './../../core/SceneManager';
import SceneAppearance from './SceneAppearance';

export default class InsertionAxisEffect {
  private effectMesh: AbstractMesh;

  turnOn(): void {
    this.effectMesh.setEnabled(true);
  }

  turnOff(): void {
    this.effectMesh.setEnabled(false);
  }

  /**
   * To show the insertionAxis effect, we need a new mesh.
   * After copying the bottom mesh, we switch the orientation and create the new mesh.
   * @param mesh The bottom mesh
   */
  public createGeometry(mesh: Mesh) {
    console.log(`Call to DistanceCalculator:createGeometry()`);

    const positions = [];
    const indices = [];

    for (const i of mesh.getIndices(false, true)) {
      indices.push(i);
    }
    for (const v of mesh.getVerticesData(VertexBuffer.PositionKind, false, true)) {
      positions.push(v);
    }
    for (let i = 0; i < indices.length / 3; i++) {
      const a = indices[i * 3 + 0];
      indices[i * 3 + 0] = indices[i * 3 + 2];
      indices[i * 3 + 2] = a;
    }

    const customMesh = new Mesh('insertionAxisEffectObject', SceneManager.getInstance().current);
    const vertexData = new VertexData();
    const normals = [];
    VertexData.ComputeNormals(positions, indices, normals);
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.applyToMesh(customMesh);
    customMesh.convertToFlatShadedMesh();
    customMesh.material = SceneAppearance.createInsertionAxisMaterial();
    customMesh.createNormals(true);
    customMesh.renderingGroupId = 1;
    customMesh.setEnabled(false);
    this.effectMesh = customMesh;
  }
}
