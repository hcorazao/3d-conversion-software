import CRHalfEdge from './CRHalfEdge';
import Edge from './edge';

export default class CREdge extends Edge {
  /**
   * This class represents an edge in a {@link module:Core.Mesh Mesh}.
   * @constructor module:Core.Edge
   * @property {module:Core.Halfedge} halfedge One of the halfedges associated with this edge.
   */
  constructor() {
    super();
  }

  update(he0: CRHalfEdge, he1: CRHalfEdge) {
    he0.twin = he1;
    he1.twin = he0;

    he0.edge = this;
    he1.edge = this;

    this.halfedge = he0;
  }

  /**
   * Computes the length of an edge.
   * @method module:Core.Geometry#length
   * @param {module:Core.Edge} e The edge whose length needs to be computed.
   * @returns {number}
   */
  length() {
    return this.halfedge.vector().length();
  }
}
