import HalfEdgeMesh from '@app/modules/geometry-processing-js/core/halfedgemesh';
import IAlgorithm from './IAlgorithm';
import ITriangleCondition from './ITriangleCondition';

/**
 * Crtriangle flood fill algorithm
 *
 */
export default class TriangleFloodFillAlgorithm implements IAlgorithm {
  constructor(startFaceId: number, mesh: HalfEdgeMesh, condition: ITriangleCondition) {
    this.startFaceId = startFaceId;
    this.mesh = mesh;
    this.condition = condition;

    this.visited = new Array<number>(mesh.faces.length);
  }

  private startFaceId: number;
  private mesh: HalfEdgeMesh;
  private condition: ITriangleCondition;

  private neighborList: number[];
  private visited: Array<number>;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    this.neighborList = [];
    this.visited.fill(0);

    this.floodfill(this.startFaceId, this.neighborList, 1);

    const t1 = performance.now();
    console.log(
      'Call to TriangleFloodFillAlgorithm:compute() took ' +
        (t1 - t0) +
        ' milliseconds with ' +
        this.neighborList.length +
        ' triangles found.'
    );

    return this.neighborList;
  }

  dilation(times: number): number[] {
    for (let i = 0; i < times; i++) {
      const newNeighbors = [];
      for (const idx of this.neighborList) {
        for (const face of this.mesh.faces[idx].adjacentFaces()) {
          if (this.visited[face.index] === 0) {
            newNeighbors.push(face.index);
            this.visited[face.index] = 1;
          }
        }
      }
      for (const n of newNeighbors) {
        this.neighborList.push(n);
      }
    }
    return this.neighborList;
  }

  fillRest(treshold: number): number[] {
    const neighbors = new Array<number[]>();
    let mark = 2;
    for (const f of this.mesh.faces) {
      if (!this.visited[f.index] && !f.isBoundaryLoop()) {
        const n = mark - 2;
        neighbors[n] = [];
        const boundaryMark = this.floodfillNoCondition(f.index, neighbors[n], mark);
        if (neighbors[n].length < treshold && boundaryMark === 1) {
          for (const i of neighbors[n]) {
            this.visited[i] = 1;
            this.neighborList.push(i);
          }
        }
        mark++;
      }
    }
    return this.neighborList;
  }

  protected floodfill(start: number, indexList: Array<number>, mark: number) {
    const nextFaces = [];

    // insert start vertex (next to center)
    nextFaces.push(start);
    this.condition.evaluateCondition(this.mesh.faces[this.startFaceId]);

    while (nextFaces.length > 0) {
      const idx = nextFaces.shift();
      indexList.push(idx);
      this.visited[idx] = mark;

      // for all adjacent faces
      for (const face of this.mesh.faces[idx].adjacentFaces()) {
        // check whether we have them already visited
        if (!this.visited[face.index] && !face.isBoundaryLoop()) {
          if (this.condition.evaluateCondition(face)) {
            nextFaces.push(face.index);
            this.visited[face.index] = mark;
          }
        }
      }
    }
  }

  protected floodfillNoCondition(start: number, indexList: Array<number>, mark: number): number {
    const nextFaces = [];
    let boundaryMark = -1;

    // insert start vertex (next to center)
    nextFaces.push(start);

    while (nextFaces.length > 0) {
      const idx = nextFaces.shift();
      indexList.push(idx);
      this.visited[idx] = mark;

      // for all adjacent faces
      for (const face of this.mesh.faces[idx].adjacentFaces()) {
        // check whether we have them already visited
        if (this.visited[face.index] === 0 && !face.isBoundaryLoop()) {
          nextFaces.push(face.index);
          this.visited[face.index] = mark;
        } else if (this.visited[face.index] !== mark) {
          boundaryMark = this.visited[face.index];
        }
      }
    }
    return boundaryMark;
  }
}
