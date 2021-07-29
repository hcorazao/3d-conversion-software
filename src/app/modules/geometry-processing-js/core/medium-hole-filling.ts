import { Color4, Vector3 } from '@babylonjs/core';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';
import CRFace from './CRFace';
import CREdge from './CREdge';
import CRVertex from './CRVertex';
import CRHalfEdge from './CRHalfEdge';
import HalfEdgeMesh from './halfedgemesh';
import MixedLaplacianSmoothMeshAlgorithm from '@app/modules/rendering/core/algorithm/MixedLaplacianSmoothMeshAlgorithm';
import RegionalLaplacianSmoothMeshAlgorithm from '@app/modules/rendering/core/algorithm/RegionalLaplacianSmoothMeshAlgorithm';
import Debug from '@app/modules/rendering/core/debug/Debug';

const DEBUG = false;
const LAMBDA = 1;

/**
 * Flips a given edge e0
 * @param e0 The edge to be flipped
 */
export function flip(e0: CREdge) {
  const t0he0 = e0.halfedge;
  const t0he1 = t0he0.next;
  const t0he2 = t0he1.next;
  const t1he0 = t0he0.twin;
  const t1he1 = t1he0.next;
  const t1he2 = t1he1.next;
  const T0 = t0he0.face;
  const T1 = t1he0.face;
  const V0 = t1he1.vertex;
  const V1 = t1he2.vertex;
  const V2 = t0he1.vertex;
  const V3 = t0he2.vertex;
  const he0 = t0he2.twin;
  const he1 = t1he1.twin;
  const he2 = t1he2.twin;
  const he3 = t0he1.twin;
  const e1 = t0he2.edge;
  const e2 = t0he1.edge;
  const e3 = t1he2.edge;
  const e4 = t1he1.edge;

  // update half edges
  t1he1.update(V0, false);
  t1he0.update(V1, false);
  t1he2.update(V1, false);
  t0he1.update(V2, false);
  t0he0.update(V3, false);
  t0he2.update(V3, false);

  // update faces
  T0.update(t0he0, t1he2, t0he1);
  T1.update(t1he0, t0he2, t1he1);

  // update edges
  e0.update(t0he0, t1he0);
  e1.update(he0, t0he2);
  e4.update(he1, t1he1);
  e3.update(he2, t1he2);
  e2.update(he3, t0he1);
}

export class MediumHoleFillingAlgorithm {
  protected mesh: CRHalfEdgeMesh;
  protected boundaryFace: CRFace;
  protected newFaces: CRFace[];
  protected newVertices: CRVertex[];
  protected boundaryVertices: CRVertex[];
  protected newEdges: CREdge[];
  protected maxEdgeLength: number;

  constructor(mesh: CRHalfEdgeMesh, boundaryFace?: CRFace) {
    this.mesh = mesh;
    this.boundaryFace = boundaryFace;
  }

  setBoundaryFace(boundaryFace: CRFace) {
    if (boundaryFace === undefined || !boundaryFace.isBoundaryLoop()) {
      console.error('Not a boundary face!');
      this.boundaryFace = undefined;
      return;
    }

    this.boundaryFace = boundaryFace;
  }

  /**
   * Computes medium hole filling algorithm
   */
  compute() {
    // check the performance
    const t0 = performance.now();

    this.newFaces = [];
    this.newVertices = [];
    this.boundaryVertices = [];
    this.newEdges = [];

    // store boundary vertex normals for later use
    this.storeBoundaryNormals();

    const boundaryTangents = [];
    let edge = this.boundaryFace.halfedge;

    do {
      const tangent = Vector3.Cross(edge.vector(), edge.vertex.normalEquallyWeighted()).scale(LAMBDA);

      boundaryTangents.push(tangent);
      if (DEBUG) {
        Debug.getInstance().add_pin(edge.vertex, tangent);
      }
      edge = edge.next;
    } while (edge !== this.boundaryFace.halfedge);

    // create patch info for minimal patch
    const patchInfo = this.minAreaPatch();

    // step 1: create the initial, minimal patch
    this.createInitialPatch(patchInfo.len, patchInfo.minHalfEdge);

    // step 2: subdivide all faces
    this.subdivideAllFaces(this.newFaces, this.newVertices, this.newEdges);

    // step 3: flip edges
    let flipped;
    for (let flips = 0; flips < 100; flips++) {
      flipped = this.flipEdges(this.newEdges);
      this.smoothTwoRing(1, this.newVertices);
      this.smooth(1, this.newVertices);
      if (!flipped) {
        break;
      }
    }

    // step 4: first laplace on coarse mesh for initial form
    this.bilaplace(boundaryTangents);

    // step 5: further refine mesh
    // const avg = (3 * this.maxEdgeLength + this.minEdgeLength) / 4;
    const avg = this.maxEdgeLength;
    for (let flips = 0; flips < 100; flips++) {
      const nbNewFaces = this.subdivideLargeFaces(this.newFaces, this.newVertices, this.newEdges, avg);

      flipped = this.flipEdges(this.newEdges);
      this.smooth(1, this.newVertices);
      flipped = this.flipEdges(this.newEdges);
      this.smooth(1, this.newVertices);

      if (!flipped) {
        break;
      }
    }

    // step 5: final bi-laplace
    this.bilaplace(boundaryTangents);

    const t1 = performance.now();
    console.log('Call to MediumHoleFillingAlgorithm:compute() took ' + (t1 - t0) + ' milliseconds.');
  }

  isFlipOk(e: CREdge) {
    // boundary edges cannot be flipped
    if (e.onBoundary()) {
      return false;
    }

    const hh = e.halfedge;
    const oh = hh.twin;

    if (hh.vertex.degree() <= 4 || oh.vertex.degree() <= 4) {
      return false;
    }

    // check if the flipped edge is already present in the mesh
    const ah = hh.next.next.vertex;
    const bh = oh.next.next.vertex;

    if (ah === bh) {
      return false;
    } // this is generally a bad sign !!!

    if (ah.onBoundary() || bh.onBoundary()) {
      return false;
    }

    for (const v of ah.adjacentVertices()) {
      if (v === bh) {
        return false;
      }
    }

    return true;
  }

  protected delaunay(e: CREdge): boolean {
    const v0 = e.halfedge.vertex;
    const v1 = e.halfedge.twin.prev.vertex;
    const v2 = e.halfedge.twin.vertex;
    const v3 = e.halfedge.prev.vertex;
    if (v0.degree() === 4 || v2.degree() === 4) {
      return false;
    }
    const n = e.halfedge.face.calcNormal();
    const n1 = CRFace.CalcNormal(v0, v1, v3);
    const n2 = CRFace.CalcNormal(v1, v2, v3);

    const f = v3.subtract(v1).length();

    return f < e.length() && Vector3.Dot(n, n1) > 0 && Vector3.Dot(n, n2) > 0;
  }

  protected shorter(e: CREdge): boolean {
    const v1 = e.halfedge.twin.prev.vertex;
    const v3 = e.halfedge.prev.vertex;
    const f = v3.subtract(v1).length();

    return f < e.length();
  }

  protected isFrontFacing(e: CREdge, n: Vector3): boolean {
    const v0 = e.halfedge.vertex;
    const v1 = e.halfedge.twin.prev.vertex;
    const v2 = e.halfedge.twin.vertex;
    const v3 = e.halfedge.prev.vertex;
    const n1 = CRFace.CalcNormal(v0, v1, v3);
    const n2 = CRFace.CalcNormal(v1, v2, v3);

    return Vector3.Dot(n, n1) > 0 && Vector3.Dot(n, n2) > 0;
  }

  protected isEdgeOnNearBoundary(e: CREdge): boolean {
    const l = this.boundaryVertices.length;
    const v = e.halfedge.vertex;
    const w = e.halfedge.twin.vertex;
    const i = this.boundaryVertices.indexOf(v);
    if (i === -1) {
      return false;
    }
    return (
      w === this.boundaryVertices[(l + i - 1) % l] ||
      w === this.boundaryVertices[(i + 1) % l] ||
      w === this.boundaryVertices[(l + i - 2) % l] ||
      w === this.boundaryVertices[(i + 2) % l] ||
      w === this.boundaryVertices[(l + i - 3) % l] ||
      w === this.boundaryVertices[(i + 3) % l] ||
      w === this.boundaryVertices[(l + i - 4) % l] ||
      w === this.boundaryVertices[(i + 4) % l] ||
      w === this.boundaryVertices[(l + i - 5) % l] ||
      w === this.boundaryVertices[(i + 5) % l] ||
      w === this.boundaryVertices[(l + i - 6) % l] ||
      w === this.boundaryVertices[(i + 6) % l]
    );
  }

  protected isNewEdgeOnBoundary(e: CREdge): boolean {
    const v = e.halfedge.prev.vertex;
    const w = e.halfedge.twin.prev.vertex;

    return v.fixedNormal !== undefined && w.fixedNormal !== undefined;
  }

  /**
   * Flips all "legal" edges
   */
  flipEdges(edges: CREdge[]): boolean {
    let flipped = false;
    for (const e of edges) {
      if (this.isFlipOk(e) && this.shorter(e) && !this.isNewEdgeOnBoundary(e)) {
        flip(e);
        flipped = true;
      }
    }
    return flipped;
  }

  protected subdivide(f0: CRFace, vertexList: CRVertex[], edgeList: CREdge[]): { T0: CRFace; T1: CRFace; T2: CRFace } {
    const h0 = f0.halfedge;
    const h1 = h0.next;
    const h2 = h1.next;
    const h3 = h0.twin;
    const h4 = h1.twin;
    const h5 = h2.twin;
    const v0 = h0.vertex;
    const v1 = h1.vertex;
    const v2 = h2.vertex;
    const c = f0.calcCenter();
    const v3 = this.mesh.createVertex(c, new Color4(1, 1, 1, 1)); // (242 / 256, 209 / 256, 107 / 256, 1));
    vertexList.push(v3);
    const e0 = h0.edge;
    const e1 = h1.edge;
    const e2 = h2.edge;

    const h6 = this.mesh.createHalfEdge(v3, false);
    const h7 = this.mesh.createHalfEdge(v1, false);
    const h8 = this.mesh.createHalfEdge(v2, false);

    const h9 = this.mesh.createHalfEdge(v3, false);
    const h10 = this.mesh.createHalfEdge(v2, false);
    const h11 = this.mesh.createHalfEdge(v0, false);

    const e3 = this.mesh.createEdge(h1, h6);
    const e4 = this.mesh.createEdge(h8, h9);
    const e5 = this.mesh.createEdge(h2, h11);
    edgeList.push(e3);
    edgeList.push(e4);
    edgeList.push(e5);

    const f1 = this.mesh.createFace(h6, h7, h8);
    const f2 = this.mesh.createFace(h9, h10, h11);

    h0.next = h1;
    h0.prev = h2;
    h0.twin = h3;
    h0.vertex = v0;
    h0.edge = e0;
    h0.face = f0;

    h1.next = h2;
    h1.prev = h0;
    h1.twin = h6;
    h1.vertex = v1;
    h1.edge = e3;
    h1.face = f0;

    h2.next = h0;
    h2.prev = h1;
    h2.twin = h11;
    h2.vertex = v3;
    h2.edge = e5;
    h2.face = f0;

    h3.twin = h0;
    h3.edge = e0;

    h4.twin = h7;
    h4.edge = e1;

    h5.twin = h10;
    h5.edge = e2;

    h6.next = h7;
    h6.prev = h8;
    h6.twin = h1;
    h6.vertex = v3;
    h6.edge = e3;
    h6.face = f1;

    h7.next = h8;
    h7.prev = h6;
    h7.twin = h4;
    h7.vertex = v1;
    h7.edge = e1;
    h7.face = f1;

    h8.next = h6;
    h8.prev = h7;
    h8.twin = h9;
    h8.vertex = v2;
    h8.edge = e4;
    h8.face = f1;

    h9.next = h10;
    h9.prev = h11;
    h9.twin = h8;
    h9.vertex = v3;
    h9.edge = e4;
    h9.face = f2;

    h10.next = h11;
    h10.prev = h9;
    h10.twin = h5;
    h10.vertex = v2;
    h10.edge = e2;
    h10.face = f2;

    h11.next = h9;
    h11.prev = h10;
    h11.twin = h2;
    h11.vertex = v0;
    h11.edge = e5;
    h11.face = f2;

    v0.halfedge = h0;
    v1.halfedge = h7;
    v2.halfedge = h10;
    v3.halfedge = h2;

    e0.halfedge = h0;
    e1.halfedge = h7;
    e2.halfedge = h10;
    e3.halfedge = h6;
    e4.halfedge = h8;
    e5.halfedge = h11;

    f0.halfedge = h0;
    f1.halfedge = h6;
    f2.halfedge = h9;

    /*
    const T0 = f;
    const t0he0 = f.halfedge;
    const t0he1 = f.halfedge.next;
    const t0he2 = f.halfedge.next.next;
    const he0 = t0he0.twin;
    const he1 = t0he1.twin;
    const he2 = t0he2.twin;
    const V0 = t0he0.vertex;
    const V1 = t0he1.vertex;
    const V2 = t0he2.vertex;

    V0.halfedge = he2;
    V1.halfedge = he0;
    V2.halfedge = he1;

    // create vertex
    const c = T0.calcCenter();
    const W = this.mesh.createVertex(c, new Color4(242 / 256, 209 / 256, 107 / 256, 1));
    this.newVertices.push(W);

    // create 6 new half edges for 2 new triangles
    const t1he0 = this.mesh.createHalfEdge(V1, false);
    const t1he1 = this.mesh.createHalfEdge(V2, false);
    const t1he2 = this.mesh.createHalfEdge(W, false);
    const t2he0 = this.mesh.createHalfEdge(V2, false);
    const t2he1 = this.mesh.createHalfEdge(V0, false);
    const t2he2 = this.mesh.createHalfEdge(W, false);

    // create 2 faces
    const T1 = this.mesh.createFace(t1he0, t1he1, t1he2);
    const T2 = this.mesh.createFace(t2he0, t2he1, t2he2);

    // update T0
    t0he2.vertex = W;
    W.halfedge = t0he2;

    // create 3 new edges and add to the list for the later edge flip
    const e0 = this.mesh.createEdge(t0he1, t1he2);
    this.newEdges.push(e0);
    const e1 = this.mesh.createEdge(t1he1, t2he2);
    this.newEdges.push(e1);
    const e2 = this.mesh.createEdge(t2he1, t0he2);
    this.newEdges.push(e2);

    // update 3 edges
    he0.edge.update(he0, t0he0);
    he1.edge.update(he1, t1he0);
    he2.edge.update(he2, t2he0);

    // Debug.getInstance().debug_face(T0);
    // Debug.getInstance().debug_face(T1);
    // Debug.getInstance().debug_face(T2);
*/
    return { T0: f0, T1: f1, T2: f2 };
  }

  subdivideAllFaces(faceList: CRFace[], vertexList: CRVertex[], edgeList: CREdge[]) {
    // subdivide all faces
    const newFaces: CRFace[] = [];
    for (const f of faceList) {
      const out = this.subdivide(f, vertexList, edgeList);
      newFaces.push(out.T1);
      newFaces.push(out.T2);
    }

    // add newly generated triangles
    for (const f of newFaces) {
      faceList.push(f);
    }
  }

  subdivideLargeFaces(faceList: CRFace[], vertexList: CRVertex[], edgeList: CREdge[], maxEdgeLength: number): number {
    let nbNewFaces = 0;
    const newFaces: CRFace[] = [];
    for (const f of faceList) {
      if (
        f.halfedge.vector().length() > maxEdgeLength ||
        f.halfedge.next.vector().length() > maxEdgeLength ||
        f.halfedge.prev.vector().length() > maxEdgeLength
      ) {
        const out = this.subdivide(f, vertexList, edgeList);
        newFaces.push(out.T1);
        newFaces.push(out.T2);
        nbNewFaces += 2;
      }
    }

    // add newly generated triangles
    for (const f of newFaces) {
      faceList.push(f);
    }

    return nbNewFaces;
  }

  protected storeBoundaryNormals() {
    let next = this.boundaryFace.halfedge;
    do {
      this.boundaryVertices.push(next.vertex);
      next.vertex.fixedNormal = next.vertex.normalAreaWeighted();
      next = next.next;
    } while (next !== this.boundaryFace.halfedge);
  }

  /**
   * Calculates the minimal are patch.
   * @returns Information about the minimal area patch (length and the starting half edge)
   */
  protected minAreaPatch(): { len: number; minHalfEdge: CRHalfEdge } {
    let minHalfEdge: CRHalfEdge;
    let minArea = 1000000;
    const len = HalfEdgeMesh.BoundaryLength(this.boundaryFace.halfedge);
    let next = this.boundaryFace.halfedge;
    for (let i = 0; i < len; i++) {
      let iter = next.next;
      let area = 0;
      for (let j = 0; j < len; j++) {
        area += CRFace.CalcAreaSquared(next.vertex, iter.vertex, iter.next.vertex);
        iter = iter.next;
      }
      if (area < minArea) {
        minHalfEdge = next;
        minArea = area;
      }
      next = next.next;
    }

    return { len, minHalfEdge };
  }

  /**
   * Creates the initial, minimal patch for a given start half edge
   * @param len The length of the boundary
   * @param minHalfEdge The start boundary half edge
   */
  protected createInitialPatch(len: number, minHalfEdge: CRHalfEdge) {
    const v0 = minHalfEdge.vertex;

    this.maxEdgeLength = 0;

    let next = minHalfEdge;
    const halfEdgesOut: CRHalfEdge[] = [];
    for (let i = 0; i < len; i++) {
      halfEdgesOut.push(next.twin);
      this.maxEdgeLength = Math.max(this.maxEdgeLength, next.vector().length());
      next = next.next;
    }

    // multiply by magic number by trying it out :-)
    // this.maxEdgeLength *= 3.5;

    const newFaces: CRFace[] = [];
    let lastHalfEdge;
    next = minHalfEdge.next;
    for (let i = 0; i < len - 2; i++) {
      // create 3* (n-2) half edges for the n-2 faces
      const h0 = this.mesh.createHalfEdge(v0, false);
      const h1 = this.mesh.createHalfEdge(next.vertex, false);
      const h2 = this.mesh.createHalfEdge(next.next.vertex, false);

      // create n-2 faces
      const f = this.mesh.createFace(h0, h1, h2);
      newFaces.push(f);

      // create n-3 edges and add to list for later edge flip
      if (lastHalfEdge) {
        const e = this.mesh.createEdge(lastHalfEdge, h0);
        this.newEdges.push(e);
      }

      // remember out half edge
      // halfEdgesOut.push(next.twin);

      // iterate
      next = next.next;

      lastHalfEdge = h2;

      // delete border half edges
      next.prev.dispose(this.mesh);
    }

    // add two remaining out half edges
    // halfEdgesOut.push(next.twin);
    // halfEdgesOut.unshift(minHalfEdge.twin);

    // delete 2 remaining border half edges
    next.dispose(this.mesh);
    minHalfEdge.dispose(this.mesh);

    // update border edges
    let cnt = 1;
    for (const f of newFaces) {
      halfEdgesOut[cnt].edge.update(halfEdgesOut[cnt], f.halfedge.next);
      cnt++;
    }

    // update 2 remaining border edges
    halfEdgesOut[0].edge.update(halfEdgesOut[0], newFaces[0].halfedge);
    halfEdgesOut[halfEdgesOut.length - 1].edge.update(
      halfEdgesOut[halfEdgesOut.length - 1],
      newFaces[newFaces.length - 1].halfedge.next.next
    );

    // delete boundary face
    this.mesh.boundaries[this.boundaryFace.index] = undefined;
    this.boundaryFace.halfedge = undefined;
    this.boundaryFace.index = -1;

    // copy the new faces to the global list
    for (const f of newFaces) {
      this.newFaces.push(f);
    }
  }

  smooth(lambda: number, newVertices: CRVertex[]) {
    const positions: Vector3[] = [];
    for (const v of newVertices) {
      const c = new Vector3();
      let num = 0;
      let totalArea = 0;
      for (const w of v.adjacentVertices()) {
        const area = Math.max(w.barycentricDualArea(), 0.0001);
        totalArea += area;
        c.addInPlace(w.scale(area));
        num++;
      }
      c.scaleInPlace(1 / totalArea);
      positions.push(c);
    }
    let i = 0;
    for (const v of newVertices) {
      const l = v.scale(1 - lambda).add(positions[i++].scale(lambda));
      v.copyFrom(l);
    }
  }

  smoothTwoRing(lambda: number, newVertices: CRVertex[]) {
    const positions: Vector3[] = [];

    for (const v of newVertices) {
      const twoRing = new Map<number, CRVertex>();

      for (const w of v.adjacentVertices()) {
        if (w.fixedNormal) {
          twoRing.set(w.index, w);
        } else {
          for (const u of w.adjacentVertices()) {
            if (u !== v) {
              twoRing.set(u.index, u);
            }
          }
        }
      }

      let totalArea = 0;
      const c = new Vector3();

      for (const w of twoRing.values()) {
        const area = Math.max(w.barycentricDualArea(), 0.0001);

        totalArea += area;
        c.addInPlace(w.scale(area));
      }
      c.scaleInPlace(1 / totalArea);
      positions.push(c);
    }

    let i = 0;

    for (const v of newVertices) {
      const l = v.scale(1 - lambda).add(positions[i++].scale(lambda));

      v.copyFrom(l);
    }
  }

  protected bilaplace(tangents?: Vector3[]) {
    if (tangents) {
      new MixedLaplacianSmoothMeshAlgorithm(this.newVertices, this.boundaryVertices, tangents).compute();
    } else {
      const oneRing = this.mesh.oneRing(this.newVertices, this.boundaryVertices);

      new RegionalLaplacianSmoothMeshAlgorithm(this.newVertices, this.boundaryVertices, oneRing).compute();
    }
  }
}
