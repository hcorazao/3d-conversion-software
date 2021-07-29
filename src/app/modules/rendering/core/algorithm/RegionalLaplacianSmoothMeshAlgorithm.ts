import IAlgorithm from './IAlgorithm';
import { SparseMatrix, Triplet } from '../../../geometry-processing-js/linear-algebra/linear-algebra.js';
import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';
import { makeLaplaceMatrix, makeMatrix, makeVertexIndexSet } from './helper';

/**
 * Builds a sparse diagonal mass matrix containing the inverse of the barycentric
 * dual area of each vertex of a mesh.
 * @param {CRVertex[]} vertices Array of vertices.
 * @returns {module:LinearAlgebra.SparseMatrix}
 */
function makeInverseLumpedMassMatrix(vertices: CRVertex[]): SparseMatrix {
  const nVertices = vertices.length;
  const triplet = new Triplet(nVertices, nVertices);

  let i = 0;
  for (const vertex of vertices) {
    triplet.addEntry(1.0 / vertex.barycentricDualArea(), i, i);
    ++i;
  }

  return SparseMatrix.fromTriplet(triplet);
}

export default class RegionalLaplacianSmoothMeshAlgorithm implements IAlgorithm {
  constructor(interior: CRVertex[], boundaryVertices: CRVertex[], oneRing: CRVertex[]) {
    this.interior = interior;
    this.boundaryVertices = boundaryVertices;
    this.oneRing = oneRing;

    // check input
    const cache = makeVertexIndexSet(interior);

    for (const vertex of boundaryVertices) {
      if (cache.has(vertex.index)) {
        throw new Error('Boundary vertices are in the interior!');
      }
      cache.add(vertex.index);
    }
    for (const vertex of oneRing) {
      if (cache.has(vertex.index)) {
        throw new Error('Ring vertices are in the interior or boundary!');
      }
    }
  }

  private interior: CRVertex[];
  private boundaryVertices: CRVertex[];
  private oneRing: CRVertex[];

  compute(): any {
    // check the performance
    const t0 = performance.now();
    const extendedInterior = this.interior.concat(this.boundaryVertices);
    const L0 = makeLaplaceMatrix(this.interior, extendedInterior);
    const fixedVertices = this.boundaryVertices.concat(this.oneRing);
    const Vf = makeMatrix(fixedVertices);
    const M = makeInverseLumpedMassMatrix(extendedInterior);
    const L1 = makeLaplaceMatrix(extendedInterior, fixedVertices);
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

    console.log('Call to RegionalLaplacianSmoothMeshAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');
    return true;
  }
}
