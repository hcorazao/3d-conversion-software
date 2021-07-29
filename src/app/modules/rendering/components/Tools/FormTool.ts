import { PickingInfo, VertexBuffer } from '@babylonjs/core';
import ViewAPI from '../../ViewApi';

import BaseTool from './BaseTool';
import SceneObjectsManager from '../SceneObjectsManager';

export default class FormTool extends BaseTool {
  constructor(add: number) {
    super();

    this.add = add;
  }

  private add: number;
  /*
  private brushFunction(r: number): number {
    const h1 = 0.2;

    if (r >= this.maxRadius) {
      return 0;
    } else if (r <= h1 * this.maxRadius) {
      return this.maxIntensity;
    } else {
      // normalize to (0..1)
      const x = (r - h1 * this.maxRadius) / (h1 * this.maxRadius);
      // fast sigmoid function
      return (1 - Math.tanh(3 * x)) * this.maxIntensity;
    }
  }
*/
  private brushFunction(r: number): number {
    if (r >= this.maxRadius) {
      return 0;
    }

    const x = r / this.maxRadius;
    const phi = Math.exp(-1 / (1 - x * x));
    return phi * this.maxIntensity;
  }

  protected applyTool(pick: PickingInfo): void {
    const t = performance.now();
    if (t - this.toolTiming < this.TOOL_TIMING_DELTA) {
      return;
    }
    this.toolTiming = t;
    this.hasChanges = true;
    ViewAPI.getInstance().API.toggleCadAssistantExportDisabled(false);

    const startVertexId = this.helper.getTriangleVertices(pick.faceId)[0];

    const vertexIndexList = this.getVertexListAsIndexList(startVertexId, pick.pickedPoint);

    const positions = this.mesh.getVerticesData(VertexBuffer.PositionKind);
    const normals = this.mesh.getVerticesData(VertexBuffer.NormalKind);

    for (const i of vertexIndexList) {
      const intensity = this.brushFunction(this.distanceMap.get(i)) * -this.add;
      positions[i * 3] += normals[i * 3] * intensity;
      positions[i * 3 + 1] += normals[i * 3 + 1] * intensity;
      positions[i * 3 + 2] += normals[i * 3 + 2] * intensity;
    }

    this.mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
    this.mesh.createNormals(true);

    SceneObjectsManager.GetInstance()
      .getDistanceCalculator()
      .updateDistanceAttributesForMesh(this.mesh, 1, vertexIndexList, this.vertexAttributes);
  }
}
