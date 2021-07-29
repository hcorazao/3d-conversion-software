import CRHalfEdge from './CRHalfEdge';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';

export default class Face {
  public halfedge: CRHalfEdge;
  public index: number;

  /**
   * This class represents a face in a {@link module:Core.Mesh Mesh}.
   * @constructor module:Core.Face
   * @property {module:Core.Halfedge} halfedge One of the halfedges associated with this face.
   */
  constructor() {
    this.dispose();
  }

  dispose(mesh?: CRHalfEdgeMesh) {
    if (mesh) {
      mesh.faces[this.index] = undefined;
    }

    this.halfedge = undefined;
    this.index = -1; // an ID between 0 and |F| - 1 if this face is not a boundary loop
    // or an ID between 0 and |B| - 1 if this face is a boundary loop, where |F| is the
    // number of faces in the mesh and |B| is the number of boundary loops in the mesh
  }

  /**
   * Checks whether this face is a boundary loop.
   * @method module:Core.Face#isBoundaryLoop
   * @returns {boolean}
   */
  isBoundaryLoop(): boolean {
    return this.halfedge.onBoundary;
  }

  /**
   * Determines whether the face has at least on boundary edge
   * @returns true if face is a boundary face
   */
  isBoundary(): boolean {
    return this.halfedge.twin.onBoundary || this.halfedge.next.twin.onBoundary || this.halfedge.next.next.twin.onBoundary;
  }

  /**
   * Convenience function to iterate over the vertices in this face.
   * Iterates over the vertices of a boundary loop if this face is a boundary loop.
   * @method module:Core.Face#adjacentVertices
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Vertex}
   * @example
   * let f = mesh.faces[0]; // or let b = mesh.boundaries[0]
   * for (let v of f.adjacentVertices()) {
   *     // Do something with v
   * }
   */
  adjacentVertices(ccw = true) {
    return new FaceVertexIterator(this.halfedge, ccw);
  }

  /**
   * Convenience function to iterate over the edges in this face.
   * Iterates over the edges of a boundary loop if this face is a boundary loop.
   * @method module:Core.Face#adjacentEdges
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Edge}
   * @example
   * let f = mesh.faces[0]; // or let b = mesh.boundaries[0]
   * for (let e of f.adjacentEdges()) {
   *     // Do something with e
   * }
   */
  adjacentEdges(ccw = true) {
    return new FaceEdgeIterator(this.halfedge, ccw);
  }

  /**
   * Convenience function to iterate over the faces neighboring this face.
   * @method module:Core.Face#adjacentFaces
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Face}
   * @example
   * let f = mesh.faces[0]; // or let b = mesh.boundaries[0]
   * for (let g of f.adjacentFaces()) {
   *     // Do something with g
   * }
   */
  adjacentFaces(ccw = true) {
    return new FaceFaceIterator(this.halfedge, ccw);
  }

  /**
   * Convenience function to iterate over the halfedges in this face.
   * Iterates over the halfedges of a boundary loop if this face is a boundary loop.
   * @method module:Core.Face#adjacentHalfedges
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Halfedge}
   * @example
   * let f = mesh.faces[0]; // or let b = mesh.boundaries[0]
   * for (let h of f.adjacentHalfedges()) {
   *     // Do something with h
   * }
   */
  adjacentHalfedges(ccw = true) {
    return new FaceHalfedgeIterator(this.halfedge, ccw);
  }

  /**
   * Convenience function to iterate over the corners in this face. Not valid if this face
   * is a boundary loop.
   * @method module:Core.Face#adjacentCorners
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Corner}
   * @example
   * let f = mesh.faces[0];
   * for (let c of f.adjacentCorners()) {
   *     // Do something with c
   * }
   */
  adjacentCorners(ccw = true) {
    return new FaceCornerIterator(this.halfedge, ccw);
  }

  /**
   * Defines a string representation for this face as its index.
   * @ignore
   * @method module:Core.Face#toString
   * @returns {string}
   */
  toString() {
    return this.index;
  }
}

/**
 * This class represents an adjacent vertex iterator for a {@link module:Core.Face Face}.
 * @ignore
 * @memberof module:Core
 */
class FaceVertexIterator {
  private halfedge: CRHalfEdge;
  private ccw: boolean;

  // constructor
  constructor(halfedge: CRHalfEdge, ccw: boolean) {
    this.halfedge = halfedge;
    this.ccw = ccw;
  }

  [Symbol.iterator]() {
    return {
      current: this.halfedge,
      end: this.halfedge,
      ccw: this.ccw,
      justStarted: true,
      next() {
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
          };
        } else {
          this.justStarted = false;
          const vertex = this.current.vertex;
          this.current = this.ccw ? this.current.next : this.current.prev;
          return {
            done: false,
            value: vertex,
          };
        }
      },
    };
  }
}

/**
 * This class represents an adjacent edge iterator for a {@link module:Core.Face Face}.
 * @ignore
 * @memberof module:Core
 */
class FaceEdgeIterator {
  private halfedge: CRHalfEdge;
  private ccw: boolean;

  // constructor
  constructor(halfedge: CRHalfEdge, ccw: boolean) {
    this.halfedge = halfedge;
    this.ccw = ccw;
  }

  [Symbol.iterator]() {
    return {
      current: this.halfedge,
      end: this.halfedge,
      ccw: this.ccw,
      justStarted: true,
      next() {
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
          };
        } else {
          this.justStarted = false;
          const edge = this.current.edge;
          this.current = this.ccw ? this.current.next : this.current.prev;
          return {
            done: false,
            value: edge,
          };
        }
      },
    };
  }
}

/**
 * This class represents an adjacent face iterator for a {@link module:Core.Face Face}.
 * @ignore
 * @memberof module:Core
 */
class FaceFaceIterator {
  private halfedge: CRHalfEdge;
  private ccw: boolean;

  // constructor
  constructor(halfedge: CRHalfEdge, ccw: boolean) {
    while (halfedge.twin.onBoundary) {
      halfedge = halfedge.next;
    } // twin halfedge must not be on the boundary
    this.halfedge = halfedge;
    this.ccw = ccw;
  }

  [Symbol.iterator]() {
    return {
      current: this.halfedge,
      end: this.halfedge,
      ccw: this.ccw,
      justStarted: true,
      next() {
        while (this.current.twin.onBoundary) {
          this.current = this.ccw ? this.current.next : this.current.prev;
        } // twin halfedge must not be on the boundary
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
          };
        } else {
          this.justStarted = false;
          const face = this.current.twin.face;
          this.current = this.ccw ? this.current.next : this.current.prev;
          return {
            done: false,
            value: face,
          };
        }
      },
    };
  }
}

/**
 * This class represents an adjacent halfedge iterator for a {@link module:Core.Face Face}.
 * @ignore
 * @memberof module:Core
 */
class FaceHalfedgeIterator {
  private halfedge: CRHalfEdge;
  private ccw: boolean;

  // constructor
  constructor(halfedge: CRHalfEdge, ccw: boolean) {
    this.halfedge = halfedge;
    this.ccw = ccw;
  }

  [Symbol.iterator]() {
    return {
      current: this.halfedge,
      end: this.halfedge,
      ccw: this.ccw,
      justStarted: true,
      next() {
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
          };
        } else {
          this.justStarted = false;
          const halfedge = this.current;
          this.current = this.ccw ? this.current.next : this.current.prev;
          return {
            done: false,
            value: halfedge,
          };
        }
      },
    };
  }
}

/**
 * This class represents an adjacent corner iterator for a {@link module:Core.Face Face}.
 * @ignore
 * @memberof module:Core
 */
class FaceCornerIterator {
  private halfedge: CRHalfEdge;
  private ccw: boolean;

  // constructor
  constructor(halfedge: CRHalfEdge, ccw: boolean) {
    this.halfedge = halfedge;
    this.ccw = ccw;
  }

  [Symbol.iterator]() {
    return {
      current: this.halfedge,
      end: this.halfedge,
      ccw: this.ccw,
      justStarted: true,
      next() {
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
          };
        } else {
          this.justStarted = false;
          this.current = this.ccw ? this.current.next : this.current.prev;
          const corner = this.current.corner; // corner will be undefined if this face is a boundary loop
          return {
            done: false,
            value: corner,
          };
        }
      },
    };
  }
}
