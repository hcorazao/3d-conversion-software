import CRVertex from '@app/modules/geometry-processing-js/core/CRVertex';
import { DenseMatrix, SparseMatrix, Triplet } from '../../../geometry-processing-js/linear-algebra/linear-algebra.js';
import { int, Vector3 } from '@babylonjs/core';

export function makeLaplaceMatrix(rows: CRVertex[], columns: CRVertex[]): SparseMatrix {
  const triplet = new Triplet(rows.length, columns.length);
  const map = makeVertexIndexMap(columns);
  let i = 0;

  for (const vertex of rows) {
    let Lii = 0;

    for (const halfEdge of vertex.adjacentHalfedges()) {
      const neighbor: CRVertex = halfEdge.twin.vertex;

      if (map.has(neighbor.index)) {
        const Lij = (halfEdge.cotan() + halfEdge.twin.cotan()) / 2;

        triplet.addEntry(-Lij, i, map.get(neighbor.index));
      }
      Lii += halfEdge.next.vector().lengthSquared() / (4 * halfEdge.face.area());
    }

    if (map.has(vertex.index)) {
      triplet.addEntry(Lii, i, map.get(vertex.index));
    }
    ++i;
  }

  return SparseMatrix.fromTriplet(triplet);
}

export function makeMatrix(vectors: Vector3[]) {
  const V = DenseMatrix.zeros(vectors.length, 3);
  let i = 0;

  for (const vertex of vectors) {
    V.set(vertex.x, i, 0);
    V.set(vertex.y, i, 1);
    V.set(vertex.z, i, 2);
    ++i;
  }
  return V;
}

export function makeVertexIndexMap(vertices: CRVertex[], n: int = 0): Map<number, number> {
  const map = new Map<number, number>();

  for (const vertex of vertices) {
    map.set(vertex.index, n++);
  }
  return map;
}

export function makeVertexIndexSet(vertices: CRVertex[]): Set<number> {
  const set = new Set<number>();

  for (const vertex of vertices) {
    set.add(vertex.index);
  }
  return set;
}
