import { PickingInfo, VertexBuffer } from '@babylonjs/core';
import ViewAPI from '../../ViewApi';
import BaseTool from './BaseTool';
import SceneObjectsManager from '../SceneObjectsManager';

export default class SmoothTool extends BaseTool {
  private h1: number;
  private readonly maxLaplaceLambda: number;

  constructor() {
    super();

    this.maxLaplaceLambda = 1.0; // default
  }

  private brushFunction(r: number): number {
    if (r >= this.maxRadius) {
      return 0;
    }
    if (r <= this.h1) {
      return this.maxLaplaceLambda;
    }

    const x = (r - this.h1) / (this.maxRadius - this.h1);
    const phi = Math.exp(-1 / (1 - x * x));
    return phi * this.maxLaplaceLambda;
  }

  protected applyTool(pick: PickingInfo): void {
    const t = performance.now();
    if (t - this.toolTiming < this.TOOL_TIMING_DELTA) {
      return;
    }
    this.toolTiming = t;
    this.hasChanges = true;
    ViewAPI.getInstance().API.toggleCadAssistantExportDisabled(false);

    this.h1 = this.maxRadius * 0.5;
    const startVertexId = this.helper.getTriangleVertices(pick.faceId)[0];

    const indices = this.mesh.getIndices();
    const vertexIndexList = this.getVertexListAsIndexList(startVertexId, pick.pickedPoint);
    // const triangleIndexList = this.calculateTriangleIndexList(indices, vertexIndexList, true);

    const positions = this.mesh.getVerticesData(VertexBuffer.PositionKind);
    // const normals = this.mesh.getVerticesData(VertexBuffer.NormalKind);

    // Laplace smoothing
    for (const i of vertexIndexList) {
      let x = 0.0;
      let y = 0.0;
      let z = 0.0;
      let l = 0;

      const oneRing = this.helper.getAdjacentVertices(i);
      for (const o1 of oneRing) {
        const oneRing2 = this.helper.getAdjacentVertices(o1);
        for (const o2 of oneRing2) {
          x += positions[o2 * 3];
          y += positions[o2 * 3 + 1];
          z += positions[o2 * 3 + 2];
          l++;
        }
      }

      const laplaceX = x / l - positions[i * 3];
      const laplaceY = y / l - positions[i * 3 + 1];
      const laplaceZ = z / l - positions[i * 3 + 2];

      const lambda = this.brushFunction(
        Math.sqrt(
          Math.pow(pick.pickedPoint._x - positions[i * 3], 2) +
            Math.pow(pick.pickedPoint._y - positions[i * 3 + 1], 2) +
            Math.pow(pick.pickedPoint._z - positions[i * 3 + 2], 2)
        )
      );

      positions[i * 3] += laplaceX * lambda;
      positions[i * 3 + 1] += laplaceY * lambda;
      positions[i * 3 + 2] += laplaceZ * lambda;
    }

    this.mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
    this.mesh.createNormals(true);

    SceneObjectsManager.GetInstance()
      .getDistanceCalculator()
      .updateDistanceAttributesForMesh(this.mesh, 1, vertexIndexList, this.vertexAttributes);
  }
}
