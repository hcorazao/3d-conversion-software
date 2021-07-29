import { Color4, Vector3 } from '@babylonjs/core';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';
import CRFace from './CRFace';
import CRVertex from './CRVertex';
import CRHalfEdge from './CRHalfEdge';

export default class Vertex extends Vector3 {
  public halfedge: CRHalfEdge;
  public index: number;
  public color: Color4;

  public fixedNormal: Vector3;

  /**
   * This class represents a vertex in a {@link module:Core.Mesh Mesh}.
   * @constructor module:Core.Vertex
   * @property {module:Core.Halfedge} halfedge One of the outgoing halfedges associated with this vertex.
   */
  constructor(x = 0, y = 0, z = 0) {
    super(x, y, z);
    this.dispose();
  }

  dispose(mesh?: CRHalfEdgeMesh) {
    if (mesh) {
      mesh.vertices[this.index] = undefined;
    }

    this.halfedge = undefined;
    this.index = -1; // an ID between 0 and |V| - 1, where |V| is the number of vertices in a mesh
    this.color = undefined;
    this.fixedNormal = undefined;
  }

  /**
   * Counts the number of edges adjacent to this vertex.
   * @method module:Core.Vertex#degree
   * @returns {number}
   */
  degree(): number {
    let k = 0;
    for (const e of this.adjacentEdges()) {
      k++;
      if (k > 100) {
        return 100;
      }
    }

    return k;
  }

  /**
   * Checks whether this vertex is isolated, i.e., it has no neighboring vertices.
   * @method module:Core.Vertex#isIsolated
   * @returns {boolean}
   */
  isIsolated(): boolean {
    return this.halfedge === undefined;
  }

  /**
   * Checks whether this vertex lies on a boundary.
   * @method module:Core.Vertex#onBoundary
   * @returns {boolean}
   */
  onBoundary(): boolean {
    for (const h of this.adjacentHalfedges()) {
      if (h.onBoundary) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convenience function to iterate over the vertices neighboring this vertex.
   * @method module:Core.Vertex#adjacentVertices
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Vertex}
   * @example
   * let v = mesh.vertices[0];
   * for (let u of v.adjacentVertices()) {
   *     // Do something with u
   * }
   */
  adjacentVertices(ccw = true) {
    return new VertexVertexIterator(this.halfedge, ccw);
  }

  /**
   * Convenience function to iterate over the edges adjacent to this vertex.
   * @method module:Core.Vertex#adjacentEdges
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Edge}
   * @example
   * let v = mesh.vertices[0];
   * for (let e of v.adjacentEdges()) {
   *     // Do something with e
   * }
   */
  adjacentEdges(ccw = true) {
    return new VertexEdgeIterator(this.halfedge, ccw);
  }

  /**
   * Convenience function to iterate over the faces adjacent to this vertex.
   * @method module:Core.Vertex#adjacentFaces
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Face}
   * @example
   * let v = mesh.vertices[0];
   * for (let f of v.adjacentFaces()) {
   *     // Do something with f
   * }
   */
  adjacentFaces(ccw = true) {
    return new VertexFaceIterator(this.halfedge, ccw);
  }

  /**
   * Convenience function to iterate over the halfedges adjacent to this vertex.
   * @method module:Core.Vertex#adjacentHalfedges
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Halfedge}
   * @example
   * let v = mesh.vertices[0];
   * for (let h of v.adjacentHalfedges()) {
   *     // Do something with h
   * }
   */
  adjacentHalfedges(ccw = true) {
    return new VertexHalfedgeIterator(this.halfedge, ccw); // outgoing halfedges
  }

  /**
   * Convenience function to iterate over the corners adjacent to this vertex.
   * @method module:Core.Vertex#adjacentCorners
   * @param {boolean} ccw A flag indicating whether iteration should be in CCW or CW order.
   * @returns {module:Core.Corner}
   * @example
   * let v = mesh.vertices[0];
   * for (let c of v.adjacentCorners()) {
   *     // Do something with c
   * }
   */
  adjacentCorners(ccw = true) {
    return new VertexCornerIterator(this.halfedge, ccw);
  }

  /**
   * Defines a string representation for this vertex as its index.
   * @ignore
   * @method module:Core.Vertex#toString
   * @returns {string}
   */

  toString(): string {
    return this.index.toString();
  }
}

/**
 * This class represents an adjacent vertex iterator for a {@link module:Core.Vertex Vertex}.
 * @ignore
 * @memberof module:Core
 */
class VertexVertexIterator {
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
      next(): { done: boolean; value: CRVertex } {
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
            value: undefined,
          };
        } else {
          this.justStarted = false;
          const vertex = this.current.twin.vertex;
          this.current = this.ccw ? this.current.twin.next : this.current.prev.twin;
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
 * This class represents an adjacent edge iterator for a {@link module:Core.Vertex Vertex}.
 * @ignore
 * @memberof module:Core
 */
class VertexEdgeIterator {
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
          this.current = this.ccw ? this.current.twin.next : this.current.prev.twin;
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
 * This class represents an adjacent face iterator for a {@link module:Core.Vertex Vertex}.
 * @ignore
 * @memberof module:Core
 */
class VertexFaceIterator {
  private halfedge: CRHalfEdge;
  private ccw: boolean;

  // constructor
  constructor(halfedge: CRHalfEdge, ccw: boolean) {
    while (halfedge.onBoundary) {
      halfedge = halfedge.twin.next;
    } // halfedge must not be on the boundary
    this.halfedge = halfedge;
    this.ccw = ccw;
  }

  [Symbol.iterator]() {
    return {
      current: this.halfedge,
      end: this.halfedge,
      ccw: this.ccw,
      justStarted: true,
      next(): { done: boolean; value: CRFace } {
        while (this.current.onBoundary) {
          this.current = this.ccw ? this.current.twin.next : this.current.prev.twin;
        } // halfedge must not be on the boundary
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
            value: undefined,
          };
        } else {
          this.justStarted = false;
          const face = this.current.face;
          this.current = this.ccw ? this.current.twin.next : this.current.prev.twin;
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
 * This class represents an adjacent halfedge iterator for a {@link module:Core.Vertex Vertex}.
 * @ignore
 * @memberof module:Core
 */
class VertexHalfedgeIterator {
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
          this.current = this.ccw ? this.current.twin.next : this.current.prev.twin;
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
 * This class represents an adjacent corner iterator for a {@link module:Core.Vertex Vertex}.
 * @ignore
 * @memberof module:Core
 */
class VertexCornerIterator {
  private halfedge: CRHalfEdge;
  private ccw: boolean;

  // constructor
  constructor(halfedge: CRHalfEdge, ccw: boolean) {
    while (halfedge.onBoundary) {
      halfedge = halfedge.twin.next;
    } // halfedge must not be on the boundary
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
        while (this.current.onBoundary) {
          this.current = this.ccw ? this.current.twin.next : this.current.prev.twin;
        } // halfedge must not be on the boundary
        if (!this.justStarted && this.current === this.end) {
          return {
            done: true,
          };
        } else {
          this.justStarted = false;
          const corner = this.current.next.corner;
          this.current = this.ccw ? this.current.twin.next : this.current.prev.twin;
          return {
            done: false,
            value: corner,
          };
        }
      },
    };
  }
}
