import IAlgorithm from './IAlgorithm';
import FriendlyGeometry from '../geometry/FriendlyGeometry';

export default class VertexFindTrianglesAlgorithm implements IAlgorithm {
  constructor(vertexList: number[], mesh: FriendlyGeometry) {
    this.vertexList = vertexList;
    this.mesh = mesh;

    // this.visited = new Array<boolean>(this.positions.length / 3);
  }

  private vertexList: number[];
  private mesh: FriendlyGeometry;

  private visited: Map<number, boolean>;

  compute(): any {
    // check the performance
    const t0 = performance.now();

    const triangleList = [];
    this.visited = new Map<number, boolean>();

    for (const v of this.vertexList) {
      this.mesh.vertexFaceIter(v, (face) => {
        if (!this.visited.has(face.id)) {
          const A = face.halfEdge0.vertex.id;
          const B = face.halfEdge1.vertex.id;
          const C = face.halfEdge2.vertex.id;
          if (this.vertexList.includes(A) && this.vertexList.includes(B) && this.vertexList.includes(C)) {
            triangleList.push(face.id);
          }
          this.visited.set(face.id, true);
        }
      });
    }

    const t1 = performance.now();
    console.log(
      'Call to CRVertexFindTrianglesAlgorithm:compute() took ' +
        (t1 - t0) +
        ' milliseconds with ' +
        triangleList.length +
        ' triangles found.'
    );

    return triangleList;
  }
}
