import CRHalfEdge from './CRHalfEdge';
import CRHalfEdgeMesh from './CRHalfEdgeMesh';

export default class Edge {
  public halfedge: CRHalfEdge;
  public index: number;

  /**
   * This class represents an edge in a {@link module:Core.Mesh Mesh}.
   * @constructor module:Core.Edge
   * @property {module:Core.Halfedge} halfedge One of the halfedges associated with this edge.
   */
  constructor() {
    this.dispose();
  }

  /**
   * Disposes the edge
   * @param [mesh] The mesh this edge belongs to
   */
  dispose(mesh?: CRHalfEdgeMesh) {
    if (mesh) {
      mesh.edges[this.index] = undefined;
    }

    this.halfedge = undefined;
    this.index = -1; // an ID between 0 and |E| - 1, where |E| is the number of edges in a mesh
  }

  /**
   * Checks whether this edge lies on a boundary.
   * @method module:Core.Edge#onBoundary
   * @returns {boolean}
   */
  onBoundary(): boolean {
    return this.halfedge.onBoundary || this.halfedge.twin.onBoundary;
  }

  /**
   * Defines a string representation for this edge as its index.
   * @ignore
   * @method module:Core.Edge#toString
   * @returns {string}
   */
  toString() {
    return this.index;
  }
}
