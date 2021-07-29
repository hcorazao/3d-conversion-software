import Debug from '@app/modules/rendering/core/debug/Debug';
import { Color3, Color4, Mesh, Vector3, VertexBuffer } from '@babylonjs/core';

import CRCorner from './CRCorner';
import CREdge from './CREdge';
import CRFace from './CRFace';
import CRHalfEdge from './CRHalfEdge';
import CRVertex from './CRVertex';

export default class HalfEdgeMesh {
  public vertices: CRVertex[];
  public edges: CREdge[];
  public faces: CRFace[];
  public corners: CRCorner[];
  public halfedges: CRHalfEdge[];
  public boundaries: CRFace[];
  public islands: number[];
  public holes: number[];
  protected generators: CRHalfEdge[];

  public mesh: Mesh;

  /**
   * This class represents a Mesh.
   * @constructor module:Core.Mesh
   * @property {module:Core.Vertex[]} vertices The vertices contained in this mesh.
   * @property {module:Core.Edge[]} edges The edges contained in this mesh.
   * @property {module:Core.Face[]} faces The faces contained in this mesh.
   * @property {module:Core.Corner[]} corners The corners contained in this mesh.
   * @property {module:Core.Halfedge[]} halfedges The halfedges contained in this mesh.
   * @property {module:Core.Face[]} boundaries The boundary loops contained in this mesh.
   * @property {Array.<module:Core.Halfedge[]>} generators An array of halfedge arrays, i.e.,
   * [[h11, h21, ..., hn1], [h12, h22, ..., hm2], ...] representing this mesh's
   * {@link https://en.wikipedia.org/wiki/Homology_(mathematics)#Surfaces homology generators}.
   */
  constructor(mesh: Mesh) {
    this.vertices = [];
    this.edges = [];
    this.faces = [];
    this.corners = [];
    this.halfedges = [];
    this.boundaries = [];
    this.islands = [];
    this.holes = [];
    this.generators = [];

    this.mesh = mesh;
  }

  /**
   * Calculates the boundarys length
   * @param he Starting boundary half edge
   * @returns Length of the boundary (number of half edges/vertices)
   */
  static BoundaryLength(he: CRHalfEdge): number {
    if (!he.onBoundary) {
      console.error('No boundary edge!');
      return -1;
    }
    let len = 1;
    let next = he.next;
    while (next !== he) {
      len++;
      next = next.next;
    }
    return len;
  }

  /**
   * Computes the euler characteristic of this mesh.
   * @method module:Core.Mesh#eulerCharacteristic
   * @returns {number}
   */
  eulerCharacteristic(): number {
    return this.vertices.length - this.edges.length + this.faces.length;
  }

  /**
   * Disposes the friendly geometry. Must be called before setting to null in order to delete and free up memory.
   */
  dispose() {}

  /**
   * Constructs this mesh.
   * @method module:Core.Mesh#build
   * @param {Object} polygonSoup A polygon soup mesh containing vertex positions and indices.
   * @param {module:LinearAlgebra.Vector[]} polygonSoup.v The vertex positions of the polygon soup mesh.
   * @param {number[]} polygonSoup.f The indices of the polygon soup mesh.
   * @returns {boolean} True if this mesh is constructed successfully and false if not
   * (when this mesh contains any one or a combination of the following - non-manifold vertices,
   *  non-manifold edges, isolated vertices, isolated faces).
   */
  protected build(ccw: boolean): boolean {
    // check the performance
    const t0 = performance.now();

    // preallocate elements
    const positions = this.mesh.getVerticesData(VertexBuffer.PositionKind);
    const colors = this.mesh.getVerticesData(VertexBuffer.ColorKind);
    const indices = this.mesh.getIndices(false, false);

    this.preallocateElements(positions, indices);

    // create and insert vertices
    const indexToVertex = new Map();
    for (let i = 0; i < positions.length / 3; i++) {
      const v = new CRVertex(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      this.vertices[i] = v;
      indexToVertex.set(i, v);

      // if vertex colors available
      if (colors) {
        v.color = new Color4(colors[i * 4], colors[i * 4 + 1], colors[i * 4 + 2], colors[i * 4 + 3]);
      }
    }

    let t1 = performance.now();
    console.log('Call to HalfEdgeMesh:build() took ' + (t1 - t0) + ' milliseconds.');

    // create and insert halfedges, edges and non boundary loop faces
    let eIndex = 0;
    const edgeCount = new Map();
    const existingHalfedges = new Map();
    const hasTwinHalfedge = new Map();
    for (let I = 0; I < indices.length; I += 3) {
      // create new face
      const f = new CRFace();
      this.faces[I / 3] = f;

      // create a halfedge for each edge of the newly created face
      for (let J = 0; J < 3; J++) {
        const h = new CRHalfEdge();
        this.halfedges[I + J] = h;
      }

      // initialize the newly created halfedges
      for (let J = 0; J < 3; J++) {
        // current halfedge goes from vertex i to vertex j
        const K = (J + 1) % 3;
        let i = indices[I + J];
        let j = indices[I + K];

        // set the current halfedge's attributes
        const h = this.halfedges[I + J];
        h.next = this.halfedges[I + K];
        h.prev = this.halfedges[I + ((J + 3 - 1) % 3)];
        h.onBoundary = false;
        hasTwinHalfedge.set(h, false);

        // point the new halfedge and vertex i to each other
        const v = indexToVertex.get(i);
        h.vertex = v;
        v.halfedge = h;

        // point the new halfedge and face to each other
        h.face = f;
        f.halfedge = h;

        // swap if i > j
        if (i > j) {
          j = [i, (i = j)][0];
        }

        const value = [i, j];
        const key = value.toString();
        if (existingHalfedges.has(key)) {
          // if a halfedge between vertex i and j has been created in the past, then it
          // is the twin halfedge of the current halfedge
          const twin = existingHalfedges.get(key);
          h.twin = twin;
          twin.twin = h;
          h.edge = twin.edge;

          hasTwinHalfedge.set(h, true);
          hasTwinHalfedge.set(twin, true);
          edgeCount.set(key, edgeCount.get(key) + 1);
        } else {
          // create an edge and set its halfedge
          const e = new CREdge();
          this.edges[eIndex++] = e;
          h.edge = e;
          e.halfedge = h;

          // record the newly created edge and halfedge from vertex i to j
          existingHalfedges.set(key, h);
          edgeCount.set(key, 1);
        }

        // check for non-manifold edges
        if (edgeCount.get(key) > 2) {
          console.error('Mesh has non-manifold edges!');
          return false;
        }
      }
    }

    t1 = performance.now();
    console.log('Call to HalfEdgeMesh:build() took ' + (t1 - t0) + ' milliseconds.');

    // create and insert boundary halfedges and "imaginary" faces for boundary cycles
    // also create and insert corners
    let hIndex = indices.length;
    let cIndex = 0;
    for (let i = 0; i < indices.length; i++) {
      // if a halfedge has no twin halfedge, create a new face and
      // link it the corresponding boundary cycle
      const h = this.halfedges[i];
      if (!hasTwinHalfedge.get(h)) {
        // create new face
        const f = new CRFace();
        this.boundaries.push(f);

        // walk along boundary cycle
        const boundaryCycle = [];
        let he = h;
        do {
          // create a new halfedge
          const bH = new CRHalfEdge();
          this.halfedges[hIndex++] = bH;
          boundaryCycle.push(bH);

          // grab the next halfedge along the boundary that does not have a twin halfedge
          let nextHe = he.next;
          while (hasTwinHalfedge.get(nextHe)) {
            nextHe = nextHe.twin.next;
          }

          // set the current halfedge's attributes
          bH.vertex = nextHe.vertex;
          bH.edge = he.edge;
          bH.onBoundary = true;

          // point the new halfedge and face to each other
          bH.face = f;
          f.halfedge = bH;

          // point the new halfedge and he to each other
          bH.twin = he;
          he.twin = bH;

          // continue walk
          he = nextHe;
        } while (he !== h);

        // link the cycle of boundary halfedges together
        const n = boundaryCycle.length;
        for (let j = 0; j < n; j++) {
          boundaryCycle[j].next = boundaryCycle[(j + n - 1) % n]; // boundary halfedges are linked in clockwise order
          boundaryCycle[j].prev = boundaryCycle[(j + 1) % n];
          hasTwinHalfedge.set(boundaryCycle[j], true);
          hasTwinHalfedge.set(boundaryCycle[j].twin, true);
        }
      }

      // point the newly created corner and its halfedge to each other
      if (!h.onBoundary) {
        const c = new CRCorner();
        c.halfedge = h;
        h.corner = c;

        this.corners[cIndex++] = c;
      }
    }

    t1 = performance.now();
    console.log('Call to HalfEdgeMesh:build() took ' + (t1 - t0) + ' milliseconds.');

    // check if mesh has isolated vertices, isolated faces or
    // non-manifold vertices
    // if (this.hasIsolatedVertices() || this.hasIsolatedFaces() || this.hasNonManifoldVertices()) {
    //   return false;
    // }

    // index elements
    this.indexElements();

    // classify boundaries
    this.classifyBoundaries(this.boundaries);

    t1 = performance.now();
    console.log('Call to HalfEdgeMesh:build() took ' + (t1 - t0) + ' milliseconds.');

    return true;
  }

  /**
   * Preallocates mesh elements.
   * @private
   * @method module:Core.Mesh#preallocateElements
   * @param {module:LinearAlgebra.Vector[]} positions The vertex positions of a polygon soup mesh.
   * @param {number[]} indices The indices of a polygon soup mesh.
   */
  preallocateElements(positions, indices) {
    /*
    let nBoundaryHalfedges = 0;
    const sortedEdges = new Map();
    for (let I = 0; I < indices.length; I += 3) {
      for (let J = 0; J < 3; J++) {
        const K = (J + 1) % 3;
        let i = indices[I + J];
        let j = indices[I + K];

        // swap if i > j
        if (i > j) {
          j = [i, (i = j)][0];
        }

        const value = [i, j];
        const key = value.toString();
        if (sortedEdges.has(key)) {
          nBoundaryHalfedges--;
        } else {
          sortedEdges.set(key, value);
          nBoundaryHalfedges++;
        }
      }
    }
*/
    const nVertices = positions.length / 3;
    // const nEdges = sortedEdges.size;
    const nFaces = indices.length / 3;
    // const nHalfedges = 2 * nEdges;
    // const nInteriorHalfedges = nHalfedges - nBoundaryHalfedges;
    /*
    // clear arrays
    this.vertices.length = 0;
    this.edges.length = 0;
    this.faces.length = 0;
    this.halfedges.length = 0;
    this.corners.length = 0;
    this.boundaries.length = 0;
    this.generators.length = 0;

    // allocate space
    /*
    this.vertices = new Array(nVertices);
    this.edges = new Array(nEdges);
    this.faces = new Array(nFaces);
    this.halfedges = new Array(nHalfedges);
    this.corners = new Array(nInteriorHalfedges);
    */
    this.vertices = [];
    this.vertices.length = nVertices;
    this.edges = [];
    this.edges.length = nVertices + nFaces + 100; // Euler characteristics (too much but will be reduced later)
    this.faces = [];
    this.faces.length = nFaces;
    this.halfedges = [];
    this.halfedges.length = 2 * this.edges.length;
    this.corners = [];
    this.corners.length = 3 * nFaces;
  }

  /**
   * Checks whether this mesh has isolated vertices.
   * @private
   * @method module:Core.Mesh#hasIsolatedVertices
   * @returns {boolean}
   */
  hasIsolatedVertices(): boolean {
    for (const v of this.vertices) {
      if (v && v.isIsolated()) {
        console.error('Mesh has isolated vertices!');
        return true;
      }
    }

    return false;
  }

  /**
   * Checks whether this mesh has isolated faces.
   * @private
   * @method module:Core.Mesh#hasIsolatedFaces
   * @returns {boolean}
   */
  hasIsolatedFaces(): boolean {
    for (const f of this.faces) {
      if (f) {
        let boundaryEdges = 0;
        for (const h of f.adjacentHalfedges()) {
          if (h.twin.onBoundary) {
            boundaryEdges++;
          }
        }

        if (boundaryEdges === 3) {
          console.error('Mesh has isolated faces!');
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks whether this mesh has non-manifold vertices.
   * @private
   * @method module:Core.Mesh#hasNonManifoldVertices
   * @returns {boolean}
   */
  hasNonManifoldVertices(): boolean {
    const adjacentFaces = new Map();
    for (const v of this.vertices) {
      if (v) {
        adjacentFaces.set(v, 0);
      }
    }

    for (const f of this.faces) {
      if (f) {
        for (const v of f.adjacentVertices()) {
          adjacentFaces.set(v, adjacentFaces.get(v) + 1);
        }
      }
    }

    for (const b of this.boundaries) {
      if (b) {
        for (const v of b.adjacentVertices()) {
          adjacentFaces.set(v, adjacentFaces.get(v) + 1);
        }
      }
    }

    for (const v of this.vertices) {
      if (v) {
        if (adjacentFaces.get(v) !== v.degree()) {
          console.error('Mesh hase non-manifold vertices!');
          Debug.getInstance().debug_point(v, 0.02, new Color3(0, 1, 1));
          // return true;
        }
      }
    }

    return false;
  }

  /**
   * Assigns indices to this mesh's elements.
   * @private
   * @method module:Core.Mesh#indexElements
   */
  indexElements() {
    const t0 = performance.now();

    let index = 0;
    const newVertices = [];
    let arrIdx = 0;
    for (index = 0; index < this.vertices.length; index++) {
      const v = this.vertices[index];
      if (v) {
        v.index = arrIdx;
        newVertices[arrIdx++] = v;
      }
    }
    this.vertices = newVertices;

    const newEdges = [];
    arrIdx = 0;
    for (index = 0; index < this.edges.length; index++) {
      const e = this.edges[index];
      if (e) {
        e.index = arrIdx;
        newEdges[arrIdx++] = e;
      }
    }
    this.edges = newEdges;

    const newFaces = [];
    arrIdx = 0;
    for (index = 0; index < this.faces.length; index++) {
      const f = this.faces[index];
      if (f) {
        f.index = arrIdx;
        newFaces[arrIdx++] = f;
      }
    }
    this.faces = newFaces;

    const newHalfEdges = [];
    arrIdx = 0;
    for (index = 0; index < this.halfedges.length; index++) {
      const h = this.halfedges[index];
      if (h) {
        h.index = arrIdx;
        newHalfEdges[arrIdx++] = h;
      }
    }
    this.halfedges = newHalfEdges;

    const newCorners = [];
    arrIdx = 0;
    for (index = 0; index < this.corners.length; index++) {
      const c = this.corners[index];
      if (c) {
        c.index = arrIdx;
        newCorners[arrIdx++] = c;
      }
    }
    this.corners = newCorners;

    for (index = 0; index < this.boundaries.length; index++) {
      const b = this.boundaries[index];
      if (!b) {
        this.boundaries.splice(index, 1);
        index--;
      } else {
        b.index = index;
      }
    }
    const t1 = performance.now();
    console.log('Call to HalfEdgeMesh:indexElements() took ' + (t1 - t0) + ' milliseconds.');
  }

  boundaryCenter(he: CRHalfEdge): Vector3 {
    if (!he.onBoundary) {
      console.error('No boundary edge!');
      return undefined;
    }
    let len = 1;
    const center = new Vector3();
    center.addInPlace(he.vertex);
    let next = he.next;
    while (next !== he) {
      center.addInPlace(next.vertex);
      len++;
      next = next.next;
    }
    center.scaleInPlace(1 / len);
    return center;
  }

  classifyBoundaries(boundaries: CRFace[]) {
    for (const b of boundaries) {
      const len = HalfEdgeMesh.BoundaryLength(b.halfedge);

      if (len < 800) {
        const c = this.boundaryCenter(b.halfedge);

        let next = b.halfedge;
        let holes = 0;
        let islands = 0;

        do {
          const he = next.twin;
          const f = next.twin.face;
          const v = he.vector();
          // Debug.getInstance().debug_point(c);
          const d = c.subtract(f.calcCenter());
          const n = f.calcNormal();
          const cross = Vector3.Cross(n, v);
          if (Vector3.Dot(d, cross) < 0) {
            islands++;
          } else {
            holes++;
          }
          next = next.next;
        } while (next !== b.halfedge);

        if (holes > islands) {
          this.holes.push(b.index);
          // console.log(b.index + ': ' + len + ' (hole)');
        } else {
          this.islands.push(b.index);
          // console.log(b.index + ': ' + len + ' (island)');
        }
      }
    }
  }
}
