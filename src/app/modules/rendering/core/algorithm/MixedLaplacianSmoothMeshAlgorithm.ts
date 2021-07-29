import IAlgorithm from './IAlgorithm';
import { SparseMatrix, Triplet } from '../../../geometry-processing-js/linear-algebra/linear-algebra.js';
import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';
import { float, Vector3 } from '@babylonjs/core';
import { makeLaplaceMatrix, makeMatrix, makeVertexIndexMap, makeVertexIndexSet } from './helper';

function makeMixedLaplaceMatrix(rows: CRVertex[], boundary: CRVertex[]): SparseMatrix {
  const triplet = new Triplet(rows.length, 2 * boundary.length);
  const map = makeVertexIndexMap(boundary);
  const cache = makeVertexIndexSet(rows);
  let i = 0;

  for (const vertex of rows) {
    let Lii = 0;
    let Nii = 0;

    for (const halfEdge of vertex.adjacentHalfedges()) {
      const neighbor: CRVertex = halfEdge.twin.vertex;
      let Lij = 0.0;

      if (cache.has(halfEdge.vertex.index) && cache.has(halfEdge.next.vertex.index) && cache.has(halfEdge.prev.vertex.index)) {
        Lij += halfEdge.cotan() / 2.0;
        Lii += halfEdge.next.vector().lengthSquared() / (4 * halfEdge.face.area());
      }

      if (
        cache.has(halfEdge.twin.vertex.index) &&
        cache.has(halfEdge.twin.next.vertex.index) &&
        cache.has(halfEdge.twin.prev.vertex.index)
      ) {
        Lij += halfEdge.twin.cotan() / 2.0;
      }

      if (map.has(neighbor.index)) {
        const Nij = halfEdge.vector().length() / 6;

        Nii += halfEdge.vector().length() / 3;
        triplet.addEntry(-Lij, i, map.get(neighbor.index));
        triplet.addEntry(Nij, i, map.get(neighbor.index) + boundary.length);
      }
    }

    if (map.has(vertex.index)) {
      triplet.addEntry(Lii, i, map.get(vertex.index));
      triplet.addEntry(Nii, i, map.get(vertex.index) + boundary.length);
    }
    ++i;
  }
  return SparseMatrix.fromTriplet(triplet);
}

/**
 * Builds a sparse diagonal mass matrix containing the inverse of the barycentric
 * dual area of each vertex of a mesh.
 * @param {CRVertex[]} vertices Array of vertices.
 * @returns {module:LinearAlgebra.SparseMatrix}
 */
function makeRestrictedInverseLumpedMassMatrix(vertices: CRVertex[]): SparseMatrix {
  const nVertices = vertices.length;
  const triplet = new Triplet(nVertices, nVertices);
  const cache = makeVertexIndexSet(vertices);

  let i = 0;
  for (const vertex of vertices) {
    let area = 0.0;

    for (const face of vertex.adjacentFaces()) {
      const edge = face.halfedge;

      if (cache.has(edge.vertex.index) && cache.has(edge.next.vertex.index) && cache.has(edge.prev.vertex.index)) {
        area += face.area() / 3.0;
      }
    }

    triplet.addEntry(1.0 / area, i, i);
    ++i;
  }

  return SparseMatrix.fromTriplet(triplet);
}

export default class MixedLaplacianSmoothMeshAlgorithm implements IAlgorithm {
  constructor(interior: CRVertex[], boundaryVertices: CRVertex[], boundaryTangents: Vector3[]) {
    this.interior = interior;
    this.boundaryVertices = boundaryVertices;
    this.boundaryTangents = boundaryTangents;

    // check input
    const cache = makeVertexIndexSet(interior);

    for (const vertex of boundaryVertices) {
      if (cache.has(vertex.index)) {
        throw new Error('Boundary vertices are in the interior!');
      }
      cache.add(vertex.index);
    }
  }

  private interior: CRVertex[];
  private boundaryVertices: CRVertex[];
  private boundaryTangents: Vector3[];

  compute(): any {
    // check the performance
    const t0 = performance.now();
    const extendedInterior = this.interior.concat(this.boundaryVertices);
    const L0 = makeLaplaceMatrix(this.interior, extendedInterior);
    const fixedVectors: Vector3[] = [...this.boundaryVertices, ...this.boundaryTangents];
    const Vf = makeMatrix(fixedVectors);
    const M = makeRestrictedInverseLumpedMassMatrix(extendedInterior);
    const L1 = makeMixedLaplaceMatrix(extendedInterior, this.boundaryVertices);
    const T = L0.timesSparse(M);
    const A = T.timesSparse(L0.transpose());
    const b = T.timesDense(L1.timesDense(Vf)).negated();
    const X = A.chol().solvePositiveDefinite(b); // solve AX = b

    // update positions
    let i = 0;
    for (const vertex of this.interior) {
      vertex.x = X.get(i, 0);
      vertex.y = X.get(i, 1);
      vertex.z = X.get(i, 2);
      ++i;
    }

    const t1 = performance.now();

    console.log('Call to MixedLaplacianSmoothMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');
    return true;
  }
}
