import { Color4, Vector3 } from '@babylonjs/core';
import CRFace from './CRFace';
import CRHalfEdge from './CRHalfEdge';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';
import CRVertex from './CRVertex';
import HalfEdgeMesh from './halfedgemesh';

export default class SmallHoleFillingAlgorithm {
  protected mesh: CRHalfEdgeMesh;
  protected boundaryFace: CRFace;

  constructor(mesh: CRHalfEdgeMesh, boundaryFace?: CRFace) {
    this.mesh = mesh;
    this.boundaryFace = boundaryFace;
  }

  setBoundaryFace(boundaryFace: CRFace) {
    if (!boundaryFace.isBoundaryLoop()) {
      console.error('Not a boundary face!');
      this.boundaryFace = undefined;
      return;
    }

    this.boundaryFace = boundaryFace;
  }

  /**
   * Computes the center vertex and the faces.
   */
  compute() {
    // check the performance
    const t0 = performance.now();

    const start = this.boundaryFace.halfedge;
    const len = HalfEdgeMesh.BoundaryLength(start);

    let next = start;
    const vertices: CRVertex[] = [];
    const halfEdgesIn: CRHalfEdge[] = [];
    const halfEdgesOut: CRHalfEdge[] = [];
    const center = new Vector3();
    for (let i = 0; i < len; i++) {
      vertices.push(next.vertex);
      center.addInPlace(next.vertex);
      halfEdgesIn.push(next);
      halfEdgesOut.push(next.twin);
      next = next.next;
    }
    center.scaleInPlace(1 / vertices.length);

    // create center vertex
    const W = this.mesh.createVertex(center, new Color4(242 / 256, 209 / 256, 107 / 256, 1));

    // delete n half edges
    for (const he of halfEdgesIn) {
      he.dispose(this.mesh);
    }

    // create 3*n new half edges for the n faces
    const newHalfEdgesIn: CRHalfEdge[] = [];
    for (let i = 0; i < len; i++) {
      const he0 = this.mesh.createHalfEdge(vertices[i], false);
      const he1 = this.mesh.createHalfEdge(vertices[(i + 1) % len], false);
      const he2 = this.mesh.createHalfEdge(W, false);
      W.halfedge = he2;
      vertices[i].halfedge = he0;

      // create new face
      this.mesh.createFace(he0, he1, he2);
      newHalfEdgesIn.push(he0);
    }

    // create & update n new edges
    for (let i = 0; i < len; i++) {
      const he1 = newHalfEdgesIn[i].next;
      const he2 = newHalfEdgesIn[(i + 1) % len].prev;
      this.mesh.createEdge(he1, he2);
      halfEdgesOut[i].edge.update(halfEdgesOut[i], newHalfEdgesIn[i]);
    }

    // delete boundary face
    this.mesh.boundaries[this.boundaryFace.index] = undefined;
    this.boundaryFace.halfedge = undefined;
    this.boundaryFace.index = -1;

    const t1 = performance.now();
    console.log('Call to SmallHoleFillingAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');
  }
}
