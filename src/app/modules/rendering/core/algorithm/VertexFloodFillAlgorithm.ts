import IAlgorithm from './IAlgorithm';
import IVertexCondition from './IVertexCondition';
import { Mesh } from '@babylonjs/core';
import MeshHelper from './MeshHelper';

export default class VertexFloodFillAlgorithm implements IAlgorithm {
  constructor(startVertexId: number, mesh: Mesh, helper: MeshHelper, condition: IVertexCondition) {
    this.startVertexId = startVertexId;
    this.mesh = mesh;
    this.helper = helper;
    this.condition = condition;

    this.visited = new Array<boolean>(helper.getNumVertices());
  }

  private startVertexId: number;
  private mesh: Mesh;
  private helper: MeshHelper;
  private condition: IVertexCondition;

  private visited: Array<boolean>;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const nextVertices = [];
    const neighborList = [];
    this.visited.fill(false);

    if (this.condition.evaluateCondition(this.helper.getVertexAt(this.startVertexId), this.startVertexId)) {
      // insert start vertex (next to center)
      nextVertices.push(this.startVertexId);
    }

    while (nextVertices.length > 0) {
      const idx = nextVertices.shift();
      neighborList.push(idx);
      this.visited[idx] = true;

      // for all adjacent vertices
      for (const vid of this.helper.getAdjacentVertices(idx)) {
        // check whether we have them already visited
        if (!this.visited[vid]) {
          if (this.condition.evaluateCondition(this.helper.getVertexAt(vid), vid)) {
            nextVertices.push(vid);
            this.visited[vid] = true;
          }
        }
      }
    }

    const t1 = performance.now();
    console.log(
      'Call to CRVertexFloodFillAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds with ' + neighborList.length + ' vertices found.'
    );

    return neighborList;
  }
}
